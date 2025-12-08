import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, BookOpen, FileText, Calendar, X, Link as LinkIcon, Video, File, Check } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useSubject } from '../context/SubjectContext';
import { format } from 'date-fns';

export function SubjectDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { themeConfig } = useTheme();
    const { subjects, addNote, deleteNote, addTopic, deleteTopic, toggleTopic, addResource, deleteResource } = useSubject();

    const subject = subjects.find(s => s.id === id);

    // Modal states
    const [showNoteModal, setShowNoteModal] = useState(false);
    const [showTopicModal, setShowTopicModal] = useState(false);
    const [showResourceModal, setShowResourceModal] = useState(false);

    // Form states
    const [noteTitle, setNoteTitle] = useState('');
    const [noteContent, setNoteContent] = useState('');
    const [topicName, setTopicName] = useState('');
    const [resourceTitle, setResourceTitle] = useState('');
    const [resourceUrl, setResourceUrl] = useState('');
    const [resourceType, setResourceType] = useState<'link' | 'file' | 'video'>('link');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    if (!subject) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className={`text-2xl font-bold ${themeConfig.text} mb-4`}>
                        Subject not found
                    </h2>
                    <button
                        onClick={() => navigate('/subjects')}
                        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold"
                    >
                        Back to Subjects
                    </button>
                </div>
            </div>
        );
    }

    const handleAddNote = () => {
        if (noteTitle.trim() && noteContent.trim() && id) {
            addNote(id, { title: noteTitle.trim(), content: noteContent.trim() });
            setNoteTitle('');
            setNoteContent('');
            setShowNoteModal(false);
        }
    };

    const handleAddTopic = () => {
        if (topicName.trim() && id) {
            addTopic(id, { name: topicName.trim(), completed: false });
            setTopicName('');
            setShowTopicModal(false);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setResourceTitle(file.name);
        }
    };

    const handleAddResource = async () => {
        if (!id) return;

        if (resourceType === 'file' && selectedFile) {
            // Convert file to base64
            const reader = new FileReader();
            reader.onload = () => {
                const base64 = reader.result as string;
                addResource(id, {
                    title: resourceTitle.trim() || selectedFile.name,
                    url: '', // Not used for files
                    type: 'file',
                    fileName: selectedFile.name,
                    fileData: base64,
                });
                setResourceTitle('');
                setResourceUrl('');
                setSelectedFile(null);
                setResourceType('link');
                setShowResourceModal(false);
            };
            reader.readAsDataURL(selectedFile);
        } else if (resourceTitle.trim() && resourceUrl.trim()) {
            addResource(id, { title: resourceTitle.trim(), url: resourceUrl.trim(), type: resourceType });
            setResourceTitle('');
            setResourceUrl('');
            setResourceType('link');
            setShowResourceModal(false);
        }
    };

    const getResourceIcon = (type: string) => {
        switch (type) {
            case 'video': return <Video className="w-5 h-5" />;
            case 'file': return <File className="w-5 h-5" />;
            default: return <LinkIcon className="w-5 h-5" />;
        }
    };

    return (
        <div className="space-y-6 pb-20">
            {/* Header with Back Button */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-4"
            >
                <button
                    onClick={() => navigate('/subjects')}
                    className={`flex items-center gap-2 ${themeConfig.textSecondary} hover:${themeConfig.text} transition-colors mb-4`}
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Back to Subjects</span>
                </button>

                {/* Subject Header Card */}
                <div className={`bg-gradient-to-r ${subject.color} rounded-2xl p-1 shadow-lg`}>
                    <div className={`${themeConfig.card} rounded-xl p-6`}>
                        <div className="flex items-center gap-4">
                            <div className={`bg-gradient-to-r ${subject.color} p-4 rounded-xl`}>
                                <BookOpen className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h1 className={`text-3xl font-bold ${themeConfig.text}`}>
                                    {subject.name}
                                </h1>
                                <p className={`${themeConfig.textSecondary} text-sm mt-1`}>
                                    Subject Details & Resources
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="px-4 grid grid-cols-3 gap-3"
            >
                <div className={`${themeConfig.card} rounded-xl p-4 text-center border ${themeConfig.text === 'text-white' ? 'border-gray-700' : 'border-gray-200'}`}>
                    <FileText className={`w-6 h-6 mx-auto mb-2 ${themeConfig.textSecondary}`} />
                    <p className={`text-2xl font-bold ${themeConfig.text}`}>{subject.notes.length}</p>
                    <p className={`text-xs ${themeConfig.textSecondary}`}>Notes</p>
                </div>
                <div className={`${themeConfig.card} rounded-xl p-4 text-center border ${themeConfig.text === 'text-white' ? 'border-gray-700' : 'border-gray-200'}`}>
                    <Calendar className={`w-6 h-6 mx-auto mb-2 ${themeConfig.textSecondary}`} />
                    <p className={`text-2xl font-bold ${themeConfig.text}`}>{subject.topics.length}</p>
                    <p className={`text-xs ${themeConfig.textSecondary}`}>Topics</p>
                </div>
                <div className={`${themeConfig.card} rounded-xl p-4 text-center border ${themeConfig.text === 'text-white' ? 'border-gray-700' : 'border-gray-200'}`}>
                    <BookOpen className={`w-6 h-6 mx-auto mb-2 ${themeConfig.textSecondary}`} />
                    <p className={`text-2xl font-bold ${themeConfig.text}`}>{subject.resources.length}</p>
                    <p className={`text-xs ${themeConfig.textSecondary}`}>Resources</p>
                </div>
            </motion.div>

            {/* Notes Section */}
            <div className="px-4 space-y-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <h2 className={`text-xl font-bold ${themeConfig.text} mb-3`}>Notes</h2>

                    {subject.notes.length > 0 && (
                        <div className="space-y-3 mb-3">
                            <AnimatePresence>
                                {subject.notes.map((note, index) => (
                                    <motion.div
                                        key={note.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        transition={{ delay: index * 0.05 }}
                                        className={`${themeConfig.card} rounded-xl p-4 border ${themeConfig.text === 'text-white' ? 'border-gray-700' : 'border-gray-200'}`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className={`font-bold ${themeConfig.text}`}>{note.title}</h3>
                                            <button
                                                onClick={() => id && deleteNote(id, note.id)}
                                                className="text-red-500 hover:text-red-600"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <p className={`${themeConfig.textSecondary} text-sm mb-2`}>{note.content}</p>
                                        <p className={`${themeConfig.textSecondary} text-xs`}>
                                            {format(new Date(note.createdAt), 'MMM dd, yyyy')}
                                        </p>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowNoteModal(true)}
                        className={`w-full ${themeConfig.card} rounded-2xl p-6 border-2 border-dashed ${themeConfig.text === 'text-white' ? 'border-gray-600' : 'border-gray-300'} hover:border-blue-400 transition-all`}
                    >
                        <div className="flex items-center justify-center gap-3">
                            <Plus className={`w-6 h-6 ${themeConfig.textSecondary}`} />
                            <span className={`font-semibold ${themeConfig.text}`}>Add Note</span>
                        </div>
                    </motion.button>
                </motion.div>

                {/* Topics Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <h2 className={`text-xl font-bold ${themeConfig.text} mb-3`}>Topics</h2>

                    {subject.topics.length > 0 && (
                        <div className="space-y-2 mb-3">
                            <AnimatePresence>
                                {subject.topics.map((topic, index) => (
                                    <motion.div
                                        key={topic.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        transition={{ delay: index * 0.05 }}
                                        className={`${themeConfig.card} rounded-xl p-4 border ${themeConfig.text === 'text-white' ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}
                                    >
                                        <div className="flex items-center gap-3 flex-1">
                                            <button
                                                onClick={() => id && toggleTopic(id, topic.id)}
                                                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${topic.completed
                                                    ? 'bg-green-500 border-green-500'
                                                    : `border-gray-400 ${themeConfig.card}`
                                                    }`}
                                            >
                                                {topic.completed && <Check className="w-4 h-4 text-white" />}
                                            </button>
                                            <span className={`${topic.completed ? 'line-through ' + themeConfig.textSecondary : themeConfig.text}`}>
                                                {topic.name}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => id && deleteTopic(id, topic.id)}
                                            className="text-red-500 hover:text-red-600"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowTopicModal(true)}
                        className={`w-full ${themeConfig.card} rounded-2xl p-6 border-2 border-dashed ${themeConfig.text === 'text-white' ? 'border-gray-600' : 'border-gray-300'} hover:border-blue-400 transition-all`}
                    >
                        <div className="flex items-center justify-center gap-3">
                            <Plus className={`w-6 h-6 ${themeConfig.textSecondary}`} />
                            <span className={`font-semibold ${themeConfig.text}`}>Add Topic</span>
                        </div>
                    </motion.button>
                </motion.div>

                {/* Resources Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <h2 className={`text-xl font-bold ${themeConfig.text} mb-3`}>Resources</h2>

                    {subject.resources.length > 0 && (
                        <div className="space-y-3 mb-3">
                            <AnimatePresence>
                                {subject.resources.map((resource, index) => (
                                    <motion.div
                                        key={resource.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        transition={{ delay: index * 0.05 }}
                                        className={`${themeConfig.card} rounded-xl p-4 border ${themeConfig.text === 'text-white' ? 'border-gray-700' : 'border-gray-200'}`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-start gap-3 flex-1">
                                                <div className={`${themeConfig.textSecondary} mt-1`}>
                                                    {getResourceIcon(resource.type)}
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className={`font-bold ${themeConfig.text} mb-1`}>{resource.title}</h3>
                                                    {resource.type === 'file' && resource.fileData ? (
                                                        <button
                                                            onClick={() => {
                                                                const link = document.createElement('a');
                                                                link.href = resource.fileData!;
                                                                link.download = resource.fileName || resource.title;
                                                                link.click();
                                                            }}
                                                            className="text-blue-500 hover:text-blue-600 text-sm font-semibold"
                                                        >
                                                            📥 Download {resource.fileName}
                                                        </button>
                                                    ) : (
                                                        <a
                                                            href={resource.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-blue-500 hover:text-blue-600 text-sm break-all"
                                                        >
                                                            {resource.url}
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => id && deleteResource(id, resource.id)}
                                                className="text-red-500 hover:text-red-600 ml-2"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowResourceModal(true)}
                        className={`w-full ${themeConfig.card} rounded-2xl p-6 border-2 border-dashed ${themeConfig.text === 'text-white' ? 'border-gray-600' : 'border-gray-300'} hover:border-blue-400 transition-all`}
                    >
                        <div className="flex items-center justify-center gap-3">
                            <Plus className={`w-6 h-6 ${themeConfig.textSecondary}`} />
                            <span className={`font-semibold ${themeConfig.text}`}>Add Resource</span>
                        </div>
                    </motion.button>
                </motion.div>
            </div>

            {/* Add Note Modal */}
            <AnimatePresence>
                {showNoteModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowNoteModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className={`${themeConfig.card} rounded-2xl p-6 max-w-md w-full shadow-2xl border ${themeConfig.text === 'text-white' ? 'border-gray-700' : 'border-gray-200'}`}
                        >
                            <h2 className={`text-2xl font-bold ${themeConfig.text} mb-4`}>Add Note</h2>
                            <input
                                type="text"
                                value={noteTitle}
                                onChange={(e) => setNoteTitle(e.target.value)}
                                placeholder="Note title"
                                className={`w-full px-4 py-3 rounded-xl border-2 ${themeConfig.background} ${themeConfig.text} ${themeConfig.text === 'text-white' ? 'border-gray-600' : 'border-gray-300'} focus:border-blue-500 focus:outline-none transition-colors mb-3`}
                                autoFocus
                            />
                            <textarea
                                value={noteContent}
                                onChange={(e) => setNoteContent(e.target.value)}
                                placeholder="Note content"
                                rows={4}
                                className={`w-full px-4 py-3 rounded-xl border-2 ${themeConfig.background} ${themeConfig.text} ${themeConfig.text === 'text-white' ? 'border-gray-600' : 'border-gray-300'} focus:border-blue-500 focus:outline-none transition-colors mb-4`}
                            />
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowNoteModal(false)}
                                    className={`flex-1 px-4 py-3 rounded-xl font-semibold ${themeConfig.background} ${themeConfig.text} border-2 ${themeConfig.text === 'text-white' ? 'border-gray-600' : 'border-gray-300'} hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddNote}
                                    className="flex-1 px-4 py-3 rounded-xl font-semibold bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all"
                                >
                                    Add Note
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Add Topic Modal */}
            <AnimatePresence>
                {showTopicModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowTopicModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className={`${themeConfig.card} rounded-2xl p-6 max-w-md w-full shadow-2xl border ${themeConfig.text === 'text-white' ? 'border-gray-700' : 'border-gray-200'}`}
                        >
                            <h2 className={`text-2xl font-bold ${themeConfig.text} mb-4`}>Add Topic</h2>
                            <input
                                type="text"
                                value={topicName}
                                onChange={(e) => setTopicName(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleAddTopic()}
                                placeholder="Topic name"
                                className={`w-full px-4 py-3 rounded-xl border-2 ${themeConfig.background} ${themeConfig.text} ${themeConfig.text === 'text-white' ? 'border-gray-600' : 'border-gray-300'} focus:border-blue-500 focus:outline-none transition-colors mb-4`}
                                autoFocus
                            />
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowTopicModal(false)}
                                    className={`flex-1 px-4 py-3 rounded-xl font-semibold ${themeConfig.background} ${themeConfig.text} border-2 ${themeConfig.text === 'text-white' ? 'border-gray-600' : 'border-gray-300'} hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddTopic}
                                    className="flex-1 px-4 py-3 rounded-xl font-semibold bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all"
                                >
                                    Add Topic
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Add Resource Modal */}
            <AnimatePresence>
                {showResourceModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowResourceModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className={`${themeConfig.card} rounded-2xl p-6 max-w-md w-full shadow-2xl border ${themeConfig.text === 'text-white' ? 'border-gray-700' : 'border-gray-200'}`}
                        >
                            <h2 className={`text-2xl font-bold ${themeConfig.text} mb-4`}>Add Resource</h2>

                            <div className="mb-4">
                                <label className={`block text-sm font-semibold ${themeConfig.text} mb-2`}>Type</label>
                                <div className="flex gap-2">
                                    {(['link', 'video', 'file'] as const).map((type) => (
                                        <button
                                            key={type}
                                            onClick={() => setResourceType(type)}
                                            className={`flex-1 px-4 py-2 rounded-xl font-semibold transition-all ${resourceType === type
                                                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                                                : `${themeConfig.background} ${themeConfig.text} border-2 ${themeConfig.text === 'text-white' ? 'border-gray-600' : 'border-gray-300'}`
                                                }`}
                                        >
                                            {type.charAt(0).toUpperCase() + type.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {resourceType === 'file' ? (
                                <>
                                    <input
                                        type="text"
                                        value={resourceTitle}
                                        onChange={(e) => setResourceTitle(e.target.value)}
                                        placeholder="Resource title (optional)"
                                        className={`w-full px-4 py-3 rounded-xl border-2 ${themeConfig.background} ${themeConfig.text} ${themeConfig.text === 'text-white' ? 'border-gray-600' : 'border-gray-300'} focus:border-blue-500 focus:outline-none transition-colors mb-3`}
                                    />
                                    <div className={`w-full px-4 py-3 rounded-xl border-2 border-dashed ${themeConfig.text === 'text-white' ? 'border-gray-600' : 'border-gray-300'} hover:border-blue-400 transition-all mb-3`}>
                                        <input
                                            type="file"
                                            onChange={handleFileSelect}
                                            className="w-full"
                                            id="file-upload"
                                        />
                                        <label htmlFor="file-upload" className={`cursor-pointer ${themeConfig.text}`}>
                                            {selectedFile ? `Selected: ${selectedFile.name}` : 'Choose a file'}
                                        </label>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <input
                                        type="text"
                                        value={resourceTitle}
                                        onChange={(e) => setResourceTitle(e.target.value)}
                                        placeholder="Resource title"
                                        className={`w-full px-4 py-3 rounded-xl border-2 ${themeConfig.background} ${themeConfig.text} ${themeConfig.text === 'text-white' ? 'border-gray-600' : 'border-gray-300'} focus:border-blue-500 focus:outline-none transition-colors mb-3`}
                                        autoFocus
                                    />
                                    <input
                                        type="url"
                                        value={resourceUrl}
                                        onChange={(e) => setResourceUrl(e.target.value)}
                                        placeholder="URL"
                                        className={`w-full px-4 py-3 rounded-xl border-2 ${themeConfig.background} ${themeConfig.text} ${themeConfig.text === 'text-white' ? 'border-gray-600' : 'border-gray-300'} focus:border-blue-500 focus:outline-none transition-colors mb-3`}
                                    />
                                </>
                            )}

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowResourceModal(false)}
                                    className={`flex-1 px-4 py-3 rounded-xl font-semibold ${themeConfig.background} ${themeConfig.text} border-2 ${themeConfig.text === 'text-white' ? 'border-gray-600' : 'border-gray-300'} hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddResource}
                                    className="flex-1 px-4 py-3 rounded-xl font-semibold bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all"
                                >
                                    Add Resource
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
