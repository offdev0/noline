import { CommentData, ReportData, useReports } from '@/context/ReportsContext';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Keyboard,
    KeyboardAvoidingView,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

interface CommentsModalProps {
    isVisible: boolean;
    onClose: () => void;
    report: ReportData | null;
}

export default function CommentsModal({ isVisible, onClose, report }: CommentsModalProps) {
    const { addComment, getComments } = useReports();
    const [comments, setComments] = useState<CommentData[]>([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const flatListRef = useRef<FlatList>(null);

    useEffect(() => {
        if (isVisible && report) {
            setLoading(true);
            const unsubscribe = getComments(report.id, (fetchedComments) => {
                setComments(fetchedComments);
                setLoading(false);
            });
            return () => unsubscribe();
        }
    }, [isVisible, report]);

    const handleSend = async () => {
        if (!newComment.trim() || !report) return;
        const text = newComment;
        setNewComment('');
        Keyboard.dismiss();
        await addComment(report.id, text);
        // Scroll to bottom after sending
        setTimeout(() => flatListRef.current?.scrollToEnd(), 200);
    };

    const renderComment = ({ item }: { item: CommentData }) => (
        <View style={styles.commentItem}>
            <View style={styles.commentAvatar}>
                <Text style={styles.avatarText}>{item.userEmail?.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={styles.commentContent}>
                <Text style={styles.commentUser}>{item.userEmail?.split('@')[0]}</Text>
                <Text style={styles.commentText}>{item.text}</Text>
            </View>
        </View>
    );

    return (
        <Modal
            visible={isVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalBackdrop}>
                <TouchableOpacity style={styles.dismissArea} activeOpacity={1} onPress={onClose} />
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.sheetContent}
                >
                    <View style={styles.sheetHandle} />
                    <Text style={styles.sheetTitle}>Comments</Text>

                    {loading ? (
                        <View style={styles.loadingBox}>
                            <ActivityIndicator color="#6366F1" />
                        </View>
                    ) : (
                        <FlatList
                            ref={flatListRef}
                            data={comments}
                            renderItem={renderComment}
                            keyExtractor={item => item.id}
                            contentContainerStyle={styles.commentsList}
                            ListEmptyComponent={() => (
                                <View style={styles.emptyBox}>
                                    <Ionicons name="chatbubbles-outline" size={48} color="#E2E8F0" />
                                    <Text style={styles.emptyText}>No comments yet. Start the conversation!</Text>
                                </View>
                            )}
                            onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
                        />
                    )}

                    <View style={styles.inputSection}>
                        <TextInput
                            style={styles.input}
                            placeholder="Add a comment..."
                            value={newComment}
                            onChangeText={setNewComment}
                            multiline
                        />
                        <TouchableOpacity
                            style={[styles.sendBtn, !newComment.trim() && styles.sendBtnDisabled]}
                            onPress={handleSend}
                            disabled={!newComment.trim()}
                        >
                            <Ionicons name="send" size={20} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.4)',
        justifyContent: 'flex-end',
    },
    dismissArea: {
        flex: 1,
    },
    sheetContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        height: '70%',
        paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    },
    sheetHandle: {
        width: 40,
        height: 5,
        backgroundColor: '#E2E8F0',
        borderRadius: 2.5,
        alignSelf: 'center',
        marginTop: 12,
        marginBottom: 16,
    },
    sheetTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#0F172A',
        textAlign: 'center',
        marginBottom: 20,
    },
    loadingBox: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    commentsList: {
        paddingHorizontal: 24,
        paddingBottom: 20,
    },
    commentItem: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    commentAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#F1F5F9',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatarText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#6366F1',
    },
    commentContent: {
        flex: 1,
        backgroundColor: '#F8FAFC',
        padding: 12,
        borderRadius: 16,
        borderTopLeftRadius: 4,
    },
    commentUser: {
        fontSize: 13,
        fontWeight: '700',
        color: '#1E293B',
        marginBottom: 4,
    },
    commentText: {
        fontSize: 14,
        color: '#475569',
        lineHeight: 20,
    },
    emptyBox: {
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        marginTop: 12,
        fontSize: 14,
        color: '#94A3B8',
        textAlign: 'center',
        paddingHorizontal: 40,
    },
    inputSection: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        backgroundColor: '#fff',
    },
    input: {
        flex: 1,
        backgroundColor: '#F1F5F9',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        maxHeight: 100,
        fontSize: 15,
        color: '#1E293B',
    },
    sendBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#6366F1',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 12,
    },
    sendBtnDisabled: {
        backgroundColor: '#E2E8F0',
    },
});
