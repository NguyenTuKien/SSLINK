import { apiRequest } from "../shared/api/http";

function buildQuery(params) {
    const search = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
            search.append(key, String(value));
        }
    });

    const query = search.toString();
    return query ? `?${query}` : "";
}

export async function createEvidenceDeclaration(payload) {
    return apiRequest("/v1/student/evidence-declarations", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export async function getStudentEvidenceDeclarations({ status, semesterId, page = 0, size = 20 } = {}) {
    return apiRequest(
        `/v1/student/evidence-declarations${buildQuery({ status, semesterId, page, size })}`,
    );
}

export async function updateEvidenceDeclaration(id, payload) {
    return apiRequest(`/v1/student/evidence-declarations/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
    });
}

export async function deleteEvidenceDeclaration(id) {
    return apiRequest(`/v1/student/evidence-declarations/${id}`, {
        method: "DELETE",
    });
}

export async function getMonitorEvidenceDeclarations({ status, semesterId, page = 0, size = 20 } = {}) {
    return apiRequest(
        `/v1/monitor/evidence-declarations${buildQuery({ status, semesterId, page, size })}`,
    );
}

export async function getMonitorEvidenceDeclarationDetail(id) {
    return apiRequest(`/v1/monitor/evidence-declarations/${id}`);
}

export async function approveMonitorEvidenceDeclaration(id, payload = {}) {
    return apiRequest(`/v1/monitor/evidence-declarations/${id}/approve`, {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export async function rejectMonitorEvidenceDeclaration(id, payload = {}) {
    return apiRequest(`/v1/monitor/evidence-declarations/${id}/reject`, {
        method: "POST",
        body: JSON.stringify(payload),
    });
}
