import {
  SettlementSummaryResponse,
  SettlementResponse,
  GetSettlementsByInstructorRequest,
  GetSettlementsBySessionRequest,
  PaySettlementRequest,
  SettlementResponseStatusEnum
} from '../generated';
import { delay, getApplications, getSessions, getTemplates } from './storage';

export const settlementApiMock = {
  async getSettlementsByInstructor(requestParameters: GetSettlementsByInstructorRequest): Promise<SettlementSummaryResponse> {
    await delay(300);
    const { instructorId } = requestParameters;

    const templates = getTemplates().filter(t => t.instructorId === instructorId);
    const templateIds = templates.map(t => t.id);
    const sessions = getSessions().filter(s => templateIds.includes((s as any).templateId));
    const sessionIds = sessions.map(s => String(s.id));

    const apps = getApplications().filter(a => sessionIds.includes(String((a as any).classId)));

    const settlements: SettlementResponse[] = apps.map(app => ({
      id: Number(app.reservationId),
      instructorId,
      reservationId: Number(app.reservationId),
      amount: 50000, // Dummy amount
      status: app.reservationStatus === 'CONFIRMED' ? SettlementResponseStatusEnum.Paid : SettlementResponseStatusEnum.Ready,
      createdAt: new Date(),
      paidAt: app.reservationStatus === 'CONFIRMED' ? new Date() : undefined
    }));

    const totalPaidAmount = settlements
      .filter(s => s.status === SettlementResponseStatusEnum.Paid)
      .reduce((acc, s) => acc + (s.amount || 0), 0);

    const totalReadyAmount = settlements
      .filter(s => s.status === SettlementResponseStatusEnum.Ready)
      .reduce((acc, s) => acc + (s.amount || 0), 0);

    return {
      settlements,
      totalPaidAmount,
      totalReadyAmount
    };
  },

  async getSettlementsBySession(requestParameters: GetSettlementsBySessionRequest): Promise<SettlementSummaryResponse> {
    await delay(300);
    const { sessionId } = requestParameters;

    const apps = getApplications().filter(a => String((a as any).classId) === String(sessionId));
    const session = getSessions().find(s => s.id === sessionId);
    const template = getTemplates().find(t => t.id === (session as any)?.templateId);

    const settlements: SettlementResponse[] = apps.map(app => ({
      id: Number(app.reservationId),
      instructorId: template?.instructorId || 0,
      reservationId: Number(app.reservationId),
      amount: 50000, // Dummy amount
      status: app.reservationStatus === 'CONFIRMED' ? SettlementResponseStatusEnum.Paid : SettlementResponseStatusEnum.Ready,
      createdAt: new Date(),
      paidAt: app.reservationStatus === 'CONFIRMED' ? new Date() : undefined
    }));

    const totalPaidAmount = settlements
      .filter(s => s.status === SettlementResponseStatusEnum.Paid)
      .reduce((acc, s) => acc + (s.amount || 0), 0);

    const totalReadyAmount = settlements
      .filter(s => s.status === SettlementResponseStatusEnum.Ready)
      .reduce((acc, s) => acc + (s.amount || 0), 0);

    return {
      settlements,
      totalPaidAmount,
      totalReadyAmount
    };
  },

  async paySettlement(requestParameters: PaySettlementRequest): Promise<SettlementResponse> {
    await delay(500);
    return {
      id: requestParameters.id,
      status: SettlementResponseStatusEnum.Paid,
      paidAt: new Date()
    };
  }
};
