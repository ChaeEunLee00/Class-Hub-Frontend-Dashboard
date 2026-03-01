import type { InstructorAdminResponse, ResetInstructorPasswordRequest } from '../generated';
import { delay } from './storage';

export const adminApiMock = {
    async getAllInstructors(): Promise<InstructorAdminResponse[]> {
        await delay(500);
        return [
            {
                instructorId: 1,
                name: '강사1',
                email: 'instructor1@example.com',
                createdAt: new Date('2023-01-01T00:00:00Z'),
                onedayClassCount: 5,
                sessionCount: 20,
                reservationCount: 100
            },
            {
                instructorId: 2,
                name: '강사2',
                email: 'instructor2@example.com',
                createdAt: new Date('2023-02-15T10:30:00Z'),
                onedayClassCount: 2,
                sessionCount: 8,
                reservationCount: 30
            }
        ];
    },

    async resetInstructorPassword(requestParameters: ResetInstructorPasswordRequest): Promise<void> {
        await delay(500);
        console.log(`Resetting password for instructor ${requestParameters.instructorId}`);
    }
};
