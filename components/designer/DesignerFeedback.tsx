import React from 'react';
import { Project, View, Comment as CommentType, User } from '../../types.ts';
import { MessageSquare } from 'lucide-react';

interface DesignerFeedbackProps {
  projects: Project[];
  setActiveView: (view: View) => void;
}

interface EnrichedComment extends CommentType {
    projectName: string;
    projectId: string;
    versionId: string;
    versionNumber: number;
}

const FeedbackCard: React.FC<{ comment: EnrichedComment; setActiveView: (view: View) => void; }> = ({ comment, setActiveView }) => {
    // A real implementation would jump to the specific version view
    // For this mock, we'll just go to the project detail view
    const handleViewProject = () => {
        setActiveView(comment.projectId);
    };

    return (
        <div className="bg-light-bg dark:bg-dark-bg-secondary rounded-lg shadow-md p-5">
            <div className="flex items-start gap-4">
                <img src={comment.user.avatarUrl} alt={comment.user.name} className="h-10 w-10 rounded-full object-cover" />
                <div className="flex-1">
                    <div className="flex justify-between items-center">
                        <div>
                            <span className="font-semibold">{comment.user.name}</span>
                            <span className="text-light-text-secondary dark:text-dark-text-secondary"> commented on </span>
                            <span className="font-semibold">{comment.projectName}</span>
                        </div>
                        <span className="text-xs text-light-text-secondary dark:text-dark-text-secondary">{comment.timestamp}</span>
                    </div>
                    <blockquote className="mt-2 text-light-text dark:text-dark-text border-l-4 border-light-border dark:border-dark-border pl-4 py-1 italic">
                        "{comment.text}"
                    </blockquote>
                    {comment.imageUrl && <img src={comment.imageUrl} alt="comment attachment" className="mt-2 rounded-lg max-w-xs"/>}
                    <button onClick={handleViewProject} className="mt-3 text-sm font-semibold text-brand-accent hover:underline">
                        View Project
                    </button>
                </div>
            </div>
        </div>
    );
}

const DesignerFeedback: React.FC<DesignerFeedbackProps> = ({ projects, setActiveView }) => {
    const allComments: EnrichedComment[] = projects.reduce((acc, project) => {
        project.versions.forEach(version => {
            version.comments.forEach(comment => {
                acc.push({ 
                    ...comment, 
                    projectName: project.name, 
                    projectId: project.id,
                    versionId: version.id,
                    versionNumber: version.versionNumber
                });
            });
        });
        return acc;
    }, [] as EnrichedComment[]);
    
    // A more robust sort would parse the date strings, but for this mock, string comparison is fine.
    const sortedComments = allComments.sort((a, b) => (a.timestamp > b.timestamp) ? -1 : 1);

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-light-text dark:text-dark-text flex items-center gap-3"><MessageSquare /> All Feedback</h1>
                <p className="text-light-text-secondary dark:text-dark-text-secondary mt-1">
                    Review all recent comments and feedback from your clients.
                </p>
            </div>
            
            <div className="max-w-4xl mx-auto space-y-6">
                {sortedComments.length > 0 ? (
                    sortedComments.map(comment => <FeedbackCard key={comment.id} comment={comment} setActiveView={setActiveView} />)
                ) : (
                    <div className="text-center py-20 bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-lg">
                        <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-lg font-medium">No feedback yet</h3>
                        <p className="mt-1 text-sm text-light-text-secondary dark:text-dark-text-secondary">When clients leave comments on your designs, they will appear here.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DesignerFeedback;