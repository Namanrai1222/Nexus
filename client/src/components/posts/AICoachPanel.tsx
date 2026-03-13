import { useMemo } from 'react';
import { Brain, CheckCircle, AlertTriangle, Lightbulb } from 'lucide-react';
import type { AIQualityResult } from '../../types';
import { cn } from '../../utils/cn';

interface AICoachPanelProps {
  title: string;
  body: string;
  postType: 'TEXT' | 'IMAGE' | 'LINK';
}

function analyzePost(title: string, body: string, postType: string): AIQualityResult {
  const suggestions: string[] = [];
  let score = 50;

  // Title checks
  if (title.length === 0) {
    suggestions.push('Add a title to your post.');
  } else {
    if (title.length < 10) {
      suggestions.push('Your title is very short. A descriptive title helps attract readers.');
    } else {
      score += 10;
    }
    if (title.length > 15) score += 5;
    if (/\?$/.test(title.trim())) score += 5; // questions are engaging
    if (title === title.toUpperCase() && title.length > 3) {
      suggestions.push('Avoid using ALL CAPS in your title.');
      score -= 10;
    }
  }

  // Body checks
  if (body.length === 0 && postType === 'TEXT') {
    suggestions.push('Add some content to your post body.');
    score -= 20;
  } else if (body.length > 0) {
    if (body.length < 50 && postType === 'TEXT') {
      suggestions.push('Consider adding more detail to your post — longer posts get more engagement.');
    } else {
      score += 10;
    }
    if (body.length > 200) score += 10;

    // Markdown formatting bonus
    if (/#{1,3}\s/.test(body)) score += 5; // headings
    if (/```/.test(body)) score += 5; // code blocks
    if (/\[.*\]\(.*\)/.test(body)) score += 5; // links
    if (/^[-*]\s/m.test(body)) score += 5; // lists

    // Paragraph structure
    const paragraphs = body.split(/\n\n+/).filter(Boolean);
    if (paragraphs.length >= 2) score += 5;
    if (paragraphs.length >= 4) score += 5;

    // Wall of text warning
    if (body.length > 500 && paragraphs.length <= 1) {
      suggestions.push('Break your text into paragraphs for better readability.');
    }
  }

  // Clamp score
  score = Math.max(0, Math.min(100, score));

  if (score >= 80 && suggestions.length === 0) {
    suggestions.push('Great job! Your post looks well-crafted.');
  }

  return { score, suggestions, similarPosts: [] };
}

export default function AICoachPanel({ title, body, postType }: AICoachPanelProps) {
  const result = useMemo(
    () => analyzePost(title, body, postType),
    [title, body, postType]
  );

  const scoreColor =
    result.score >= 70 ? 'text-green' : result.score >= 40 ? 'text-yellow' : 'text-red';
  const scoreBg =
    result.score >= 70 ? 'bg-green/10' : result.score >= 40 ? 'bg-yellow/10' : 'bg-red/10';

  return (
    <div className="card-nx p-4 space-y-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-text">
        <Brain className="w-4 h-4 text-purple" />
        Writing Coach
      </div>

      {/* Score */}
      <div className={cn('rounded-lg p-3 flex items-center gap-3', scoreBg)}>
        <div className={cn('text-2xl font-bold tabular-nums', scoreColor)}>
          {result.score}
        </div>
        <div>
          <p className={cn('text-sm font-medium', scoreColor)}>
            Quality Score
          </p>
          <p className="text-xs text-subtext">
            {result.score >= 70
              ? 'Looking good!'
              : result.score >= 40
                ? 'Room for improvement'
                : 'Needs more work'}
          </p>
        </div>
      </div>

      {/* Suggestions */}
      {result.suggestions.length > 0 && (
        <div className="space-y-2">
          {result.suggestions.map((s, i) => (
            <div key={i} className="flex items-start gap-2 text-sm">
              {result.score >= 70 ? (
                <CheckCircle className="w-4 h-4 text-green shrink-0 mt-0.5" />
              ) : (
                <Lightbulb className="w-4 h-4 text-yellow shrink-0 mt-0.5" />
              )}
              <span className="text-subtext">{s}</span>
            </div>
          ))}
        </div>
      )}

      {/* Tips */}
      <div className="border-t border-border pt-3">
        <p className="text-xs font-medium text-subtext mb-1.5">Quick tips</p>
        <ul className="text-xs text-subtext/80 space-y-1">
          <li>• Use headings and lists for structure</li>
          <li>• Ask a question to encourage discussion</li>
          <li>• Add code blocks with triple backticks</li>
        </ul>
      </div>
    </div>
  );
}
