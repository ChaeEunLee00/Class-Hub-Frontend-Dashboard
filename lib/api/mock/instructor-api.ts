import type { GetMyClasses1Request, OnedayClassDetailResponse, UpdateInstructorRequest, WithdrawRequest } from '../generated';
import { delay, getTemplates, getSessions } from './storage';

export const instructorApiMock = {
    async getMyClasses1(requestParameters: GetMyClasses1Request): Promise<Array<OnedayClassDetailResponse>> {
        await delay(500);
        const templates = getTemplates();
        const instructorTemplates = templates.filter(t => t.instructorId === requestParameters.instructorId);

        const sessions = getSessions();

        return instructorTemplates.map(t => ({
            id: t.id,
            title: t.name,
            description: t.description,
            location: t.location,
            sessions: sessions.filter((s: any) => s.templateId === t.id)
        }));
    },

    async updateInstructor(requestParameters: UpdateInstructorRequest): Promise<void> {
        await delay(500);
        console.log('[Mock] Instructor updated:', requestParameters);
        // In a real mock, we might update localStorage user data here
        // For now, just simulate success
    },

    async withdraw(requestParameters: WithdrawRequest): Promise<void> {
        await delay(500);
        console.log('[Mock] Instructor withdrawn:', requestParameters);
    }
};
