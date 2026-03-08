import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FileText, Link2, Image, X, Loader2 } from 'lucide-react';
import { useCreatePost } from '../../hooks/usePosts';
import { communityApi } from '../../api/communityApi';
import { cn } from '../../utils/cn';

type PostType = 'TEXT' | 'LINK' | 'IMAGE';

const tabs: { type: PostType; label: string; icon: React.ReactNode }[] = [
  { type: 'TEXT', label: 'Text', icon: <FileText className="w-4 h-4" /> },
  { type: 'LINK', label: 'Link', icon: <Link2 className="w-4 h-4" /> },
  { type: 'IMAGE', label: 'Image', icon: <Image className="w-4 h-4" /> },
];

export default function PostEditor() {
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

  // Fetch communities for the dropdown
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
        if (post?.slug) navigate(`/post/${post.slug}`);
        else navigate('/');
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Community selector */}
      <div>
        <label className="block text-sm font-medium mb-1.5">Community</label>
        <select
          value={communityId}
          onChange={(e) => setCommunityId(e.target.value)}
          required
          className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="">Choose a community</option>
          {communities.map((c) => (
            <option key={c.id} value={c.id}>
              c/{c.name}
            </option>
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
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
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
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          maxLength={300}
          className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
        <div className="text-xs text-muted-foreground mt-1 text-right">{title.length}/300</div>
      </div>

      {/* Body (Text & Link) */}
      {(postType === 'TEXT' || postType === 'LINK') && (
        <div>
          <textarea
            placeholder={postType === 'LINK' ? 'Description (optional)' : 'What are your thoughts?'}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={6}
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      )}

      {/* Link URL */}
      {postType === 'LINK' && (
        <div>
          <input
            type="url"
            placeholder="https://example.com"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            required
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      )}

      {/* Image upload */}
      {postType === 'IMAGE' && (
        <div>
          <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
            {imagePreview ? (
              <img src={imagePreview} alt="Preview" className="max-h-36 rounded object-contain" />
            ) : (
              <div className="text-center text-muted-foreground">
                <Image className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm">Click to upload an image</p>
                <p className="text-xs mt-1">PNG, JPG, WEBP, GIF up to 5MB</p>
              </div>
            )}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>
          {imageFile && (
            <button
              type="button"
              onClick={() => {
                setImageFile(null);
                setImagePreview(null);
              }}
              className="mt-2 text-xs text-destructive hover:underline"
            >
              Remove image
            </button>
          )}
          <textarea
            placeholder="Caption (optional)"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={3}
            className="mt-3 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      )}

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium mb-1.5">Tags ({tags.length}/5)</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {tags.map((t) => (
            <span
              key={t}
              className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium"
            >
              #{t}
              <button
                type="button"
                onClick={() => setTags(tags.filter((x) => x !== t))}
                className="hover:text-destructive"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
        {tags.length < 5 && (
          <input
            type="text"
            placeholder="Add a tag and press Enter"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
            onBlur={handleAddTag}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        )}
      </div>

      {/* Submit */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={createMutation.isPending || !title.trim() || !communityId}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          Post
        </button>
      </div>
    </form>
  );
}
