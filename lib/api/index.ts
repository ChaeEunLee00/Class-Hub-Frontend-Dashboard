/**
 * API 서비스 진입점
 * - USE_MOCK 설정에 따라 Mock/Real API 자동 선택
 * - 컴포넌트에서는 이 파일에서만 import
 */

import { USE_MOCK } from './config/api-config';

// Mock APIs
import {
  templateApiMock,
  sessionApiMock,
  memberApiMock,
  reservationApiMock,
  messageTemplateApiMock,
  authApiMock,
  instructorApiMock,
  adminApiMock,
  initializeDemoData as initializeDemoDataMock,
  uploadImageApiMock,
  settlementApiMock,
} from './mock';

import { LocalAuthApi } from './LocalAuthApi';
import { UploadImageApi } from './UploadImageApi';
import { apiConfig } from './config/generated-client';
import { InstructorApi, AdminControllerApi, MessageTemplateApi, OnedayClassApi, SessionApi, MemberApi, ReservationApi, MessageApi, SettlementControllerApi } from './generated';
export { type InstructorAdminResponse, type MessageTemplateMetadata, type MessageTemplateResponse, MessageTemplateResponseTypeEnum, type OnedayClassResponse, type OnedayClassDetailResponse, type SessionResponse, type LocalTime, type ReservationResponse, type MemberResponseDto, ManualMessageRequestTemplateTypeEnum, type MessageHistoryResponse, MessageHistoryResponseStatusEnum, type SettlementResponse, type SettlementSummaryResponse, SettlementResponseStatusEnum } from './generated';
export type { UploadResult } from './UploadImageApi';
export type { GetTemplateRequest } from './generated';

// Types
import type {
  AuthServiceInterface,
} from './types';

// ============================================================
// API 스위칭 (이 파일에서만!)
// ============================================================

export const onedayClassApi = USE_MOCK ? templateApiMock : new OnedayClassApi(apiConfig);
export const sessionApi = USE_MOCK ? sessionApiMock : new SessionApi(apiConfig);
export const memberApi = USE_MOCK ? memberApiMock : new MemberApi(apiConfig);
export const reservationApi = USE_MOCK ? reservationApiMock : new ReservationApi(apiConfig);
export const messageTemplateApi = USE_MOCK ? messageTemplateApiMock : new MessageTemplateApi(apiConfig);
export const messageApi = USE_MOCK ? ({} as any) : new MessageApi(apiConfig);


export const authApi: AuthServiceInterface = USE_MOCK ? authApiMock : new LocalAuthApi(apiConfig);
export const instructorApi = USE_MOCK ? instructorApiMock : new InstructorApi(apiConfig);
export const adminControllerApi = USE_MOCK ? adminApiMock : new AdminControllerApi(apiConfig);
export const uploadImageApi = USE_MOCK ? uploadImageApiMock : new UploadImageApi();
export const settlementApi = USE_MOCK ? settlementApiMock : new SettlementControllerApi(apiConfig);

// 데모 데이터 초기화 (Mock 모드에서만 동작)
export const initializeDemoData = async (instructorId: string): Promise<void> => {
  if (USE_MOCK) {
    await initializeDemoDataMock(instructorId);
  }
};

// ============================================================
// Re-exports (컴포넌트에서 타입도 여기서 import)
// ============================================================

// Types
export type {

  // Auth types
  User,
} from './types';

// Config
export { API_URL, USE_MOCK } from './config/api-config';

// API 객체 (편의용)
export const api = {
  onedayClass: onedayClassApi,
  session: sessionApi,
  member: memberApi,
  reservation: reservationApi,
  messageTemplate: messageTemplateApi,
  message: messageApi,
  auth: authApi,
  instructor: instructorApi,
  admin: adminControllerApi,
  upload: uploadImageApi,
  settlement: settlementApi,
  initializeDemoData,
};

export default api;