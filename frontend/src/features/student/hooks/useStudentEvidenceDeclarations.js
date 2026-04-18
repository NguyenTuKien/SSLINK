import { useCallback, useEffect, useState } from "react";
import {
    createEvidenceDeclaration,
    deleteEvidenceDeclaration,
    getStudentEvidenceDeclarations,
    updateEvidenceDeclaration,
} from "../../../api/evidenceDeclarationApi";

export function useStudentEvidenceDeclarations({ semesterId, status, page = 0, size = 20 }) {
    const [items, setItems] = useState([]);
    const [pagination, setPagination] = useState({
        page,
        size,
        totalItems: 0,
        totalPages: 0,
    });
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const fetchDeclarations = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const response = await getStudentEvidenceDeclarations({
                semesterId,
                status,
                page,
                size,
            });

            const list = Array.isArray(response?.items) ? response.items : [];
            setItems(list);
            setPagination({
                page: response?.page ?? page,
                size: response?.size ?? size,
                totalItems: response?.totalItems ?? 0,
                totalPages: response?.totalPages ?? 0,
            });
        } catch (err) {
            setError(err.message || "Không thể tải danh sách minh chứng.");
        } finally {
            setLoading(false);
        }
    }, [page, semesterId, size, status]);

    useEffect(() => {
        fetchDeclarations();
    }, [fetchDeclarations]);

    const createDeclaration = useCallback(async (payload) => {
        setSubmitting(true);
        setError("");
        try {
            await createEvidenceDeclaration(payload);
            await fetchDeclarations();
        } catch (err) {
            setError(err.message || "Không thể tạo minh chứng.");
            throw err;
        } finally {
            setSubmitting(false);
        }
    }, [fetchDeclarations]);

    const updateDeclaration = useCallback(async (id, payload) => {
        setSubmitting(true);
        setError("");
        try {
            await updateEvidenceDeclaration(id, payload);
            await fetchDeclarations();
        } catch (err) {
            setError(err.message || "Không thể cập nhật minh chứng.");
            throw err;
        } finally {
            setSubmitting(false);
        }
    }, [fetchDeclarations]);

    const removeDeclaration = useCallback(async (id) => {
        setSubmitting(true);
        setError("");
        try {
            await deleteEvidenceDeclaration(id);
            await fetchDeclarations();
        } catch (err) {
            setError(err.message || "Không thể xóa minh chứng.");
            throw err;
        } finally {
            setSubmitting(false);
        }
    }, [fetchDeclarations]);

    return {
        items,
        pagination,
        loading,
        submitting,
        error,
        fetchDeclarations,
        createDeclaration,
        updateDeclaration,
        removeDeclaration,
    };
}
