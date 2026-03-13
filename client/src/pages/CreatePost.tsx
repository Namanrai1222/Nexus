import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FileText, Link2, Image, X, Loader2, Eye, ChevronRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useCreatePost } from '../hooks/usePosts';
import { communityApi } from '../api/communityApi';
import { cn } from '../utils/cn';
import { usePageTitle } from '../hooks/usePageTitle';
import AICoachPanel from '../components/posts/AICoachPanel';

type PostType = 'TEXT' | 'LINK' | 'IMAGE';

const tabs: { type: PostType; label: string; icon: React.ReactNode }[] = [
  { type: 'TEXT', label: 'Text', icon: <FileText size={14} /> },
  { type: 'LINK', label: 'Link', icon: <Link2 size={14} /> },
  { type: 'IMAGE', label: 'Image', icon: <Image size={14} /> },
];

export default function CreatePost() {
  usePageTitle('New Post');
  const navigate = useNavigate();
  const createMutation = useCreatePost();

  const [postType, setPostType] = useState<PostType>('TEXT');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [communityId, setCommunityId] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const { data: communitiesData } = useQuery({
    queryKey: ['communities'],
    queryFn: async () => {
      const { data } = await communityApi.getAll();
      return data.data;
    },
  });
  const communities = communitiesData?.communities ?? [];

  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !tags.includes(tag) && tags.length < 5) {
      setTags([...tags, tag]);
      setTagInput('');
    }
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', title);
    formData.append('communityId', communityId);
    formData.append('type', postType);
    if (tags.length > 0) formData.append('tags', JSON.stringify(tags));

    if (postType === 'TEXT') {
      formData.append('body', body);
    } else if (postType === 'LINK') {
      formData.append('body', body);
      formData.append('linkUrl', linkUrl);
    } else if (postType === 'IMAGE' && imageFile) {
      formData.append('image', imageFile);
      if (body) formData.append('body', body);
    }

    createMutation.mutate(formData, {
      onSuccess: (res) => {
        const post = res.data.data;
        if (post?.slug) navigate(`/r/${post.community.slug}/post/${post.slug}`);
        else navigate('/feed');
      },
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-sm text-subtext mb-4">
        <Link to="/feed" className="hover:text-text transition-colors">Feed</Link>
        <ChevronRight size={14} />
        <span className="text-text">Create Post</span>
      </nav>

      <h1 className="text-2xl font-display font-bold text-text mb-6">Create a Post</h1>

      <div className="flex gap-6">
        {/* Editor */}
        <div className="flex-1 min-w-0">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Community selector */}
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">Community</label>
              <select
                value={communityId}
                onChange={(e) => setCommunityId(e.target.value)}
                required
                className="input-nx"
              >
                <option value="">Choose a community</option>
                {communities.map((c) => (
                  <option key={c.id} value={c.id}>r/{c.name}</option>
                ))}
              </select>
            </div>

            {/* Post type tabs */}
            <div className="flex border-b border-border">
              {tabs.map((tab) => (
                <button
                  key={tab.type}
                  type="button"
                  onClick={() => setPostType(tab.type)}
                  className={cn(
                    'flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors',
                    postType === tab.type
                      ? 'border-purple text-purple'
                      : 'border-transparent text-subtext hover:text-text'
                  )}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Title */}
            <div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                maxLength={300}
                placeholder="Title"
                className="input-nx text-lg font-medium"
              />
              <p className="text-xs text-subtext mt-1">{title.length}/300</p>
            </div>

            {/* Body */}
            {(postType === 'TEXT' || postType === 'LINK') && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-text">Body {postType === 'TEXT' ? '(Markdown supported)' : '(Optional)'}</label>
                  <button
                    type="button"
                    onClick={() => setShowPreview(!showPreview)}
                    className="text-xs text-subtext hover:text-text flex items-center gap-1"
                  >
                    <Eye size={12} /> {showPreview ? 'Edit' : 'Preview'}
                  </button>
                </div>
                {showPreview ? (
                  <div className="card-nx p-4 min-h-[200px] prose prose-sm prose-invert max-w-none">
                    <ReactMarkdown>{body || '*Nothing to preview*'}</ReactMarkdown>
                  </div>
                ) : (
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    rows={8}
                    placeholder="Write your post content..."
                    className="input-nx resize-y min-h-[200px] font-mono text-sm"
                  />
                )}
              </div>
            )}

            {/* Link URL */}
            {postType === 'LINK' && (
              <div>
                <label className="block text-sm font-medium text-text mb-1.5">URL</label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  required
                  placeholder="https://example.com"
                  className="input-nx"
                />
              </div>
            )}

            {/* Image upload */}
            {postType === 'IMAGE' && (
              <div>
                <label className="block text-sm font-medium text-text mb-1.5">Image</label>
                {imagePreview ? (
                  <div className="relative">
                    <img src={imagePreview} alt="Preview" className="max-h-64 rounded-lg" />
                    <button
                      type="button"
                      onClick={() => { setImageFile(null); setImagePreview(null); }}
                      className="absolute top-2 right-2 p-1 bg-bg/80 rounded-full text-subtext hover:text-text"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-purple/40 transition-colors">
                    <Image size={24} className="text-subtext mb-2" />
                    <span className="text-sm text-subtext">Click to upload</span>
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  </label>
                )}
              </div>
            )}

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">Tags (max 5)</label>
              <div className="flex flex-wrap items-center gap-1.5 mb-2">
                {tags.map((tag) => (
                  <span key={tag} className="tag-nx text-xs flex items-center gap-1">
                    #{tag}
                    <button type="button" onClick={() => setTags(tags.filter((t) => t !== tag))}>
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                onBlur={handleAddTag}
                placeholder="Add a tag and press Enter"
                className="input-nx"
                disabled={tags.length >= 5}
              />
            </div>

            <button
              type="submit"
              disabled={createMutation.isPending || !title.trim() || !communityId}
              className="btn-primary w-full py-3"
            >
              {createMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : 'Publish Post →'}
            </button>
          </form>
        </div>

        {/* Sidebar: Coach + Preview (desktop) */}
        <div className="hidden lg:block w-80 shrink-0 space-y-4">
          <div className="sticky top-20 space-y-4">
            <AICoachPanel title={title} body={body} postType={postType} />
            <div className="card-nx p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-subtext mb-3">Live Preview</h3>
            <div className="space-y-3">
              {title ? (
                <h2 className="font-display font-bold text-text">{title}</h2>
              ) : (
                <div className="h-5 bg-bg3 rounded w-3/4" />
              )}
              {body ? (
                <div className="prose prose-sm prose-invert max-w-none text-sm text-subtext">
                  <ReactMarkdown>{body.slice(0, 300)}</ReactMarkdown>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="h-3 bg-bg3 rounded w-full" />
                  <div className="h-3 bg-bg3 rounded w-2/3" />
                </div>
              )}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {tags.map((t) => (
                    <span key={t} className="text-xs text-purple">#{t}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
