import { useEffect, useCallback } from 'react';
import { useSocket } from '../context/SocketContext';
import type { Comment } from '../types';

/**
 * Hook to manage Socket.IO events for a specific post room.
 * Joins the post room on mount and leaves on cleanup.
 */
export function useSocketPost(
  postId: string | undefined,
  onCommentAdded?: (comment: Comment) => void,
  onScoreUpdated?: (data: { postId: string; score: number }) => void
) {
  const socket = useSocket();

  useEffect(() => {
    if (!socket || !postId) return;

    socket.emit('join-post', postId);

    if (onCommentAdded) {
      socket.on('comment-added', onCommentAdded);
    }
    if (onScoreUpdated) {
      socket.on('score-updated', onScoreUpdated);
    }

    return () => {
      socket.emit('leave-post', postId);
      if (onCommentAdded) socket.off('comment-added', onCommentAdded);
      if (onScoreUpdated) socket.off('score-updated', onScoreUpdated);
    };
  }, [socket, postId, onCommentAdded, onScoreUpdated]);

  const emitNewComment = useCallback(
    (comment: Comment) => {
      if (socket && postId) {
        socket.emit('new-comment', { postId, comment });
      }
    },
    [socket, postId]
  );

  return { emitNewComment, socket };
}
