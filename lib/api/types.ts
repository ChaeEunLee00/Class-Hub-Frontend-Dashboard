




// ============================================================
// Auth Types
// ============================================================

export interface User {
  id: string;
  email: string;
  name?: string;
  phoneNumber?: string;
  role?: string;
  createdAt: string;
  profileUrl?: string;
}

// ============================================================
// Service Interfaces
// ============================================================

import {
  LoginOperationRequest,
  LoginResponse,
  SignUpOperationRequest,
  LoginStatusResponse
} from './generated';

export interface AuthServiceInterface {
  login(requestParameters: LoginOperationRequest): Promise<LoginResponse>;
  signUp(requestParameters: SignUpOperationRequest): Promise<number>; // Real returns number (id), Mock returns number
  logout(): Promise<void>;
  checkLoginStatus(): Promise<LoginStatusResponse>;
  refresh(): Promise<void>;
  getCurrentUser(): Promise<User | null>;
  isLoggedIn(): Promise<boolean>;
}

// End of file



/*
}

// Message Template Detail
export interface MessageTemplateDetail {
  type: MessageTemplateType;
  title: string;
  description: string;
  body: string;
}

export interface IMessageTemplateApi {
  getTitles(): Promise<MessageTemplateListItem[]>; // Returns list of templates with metadata
  getDetails(title: string): Promise<MessageTemplateDetail>; // Returns details for a title
}
*/
/*
export interface IMessageHistoryApi {
  getBySessionId(sessionId: string): Promise<Message[]>;
  save(message: Message): Promise<void>;
}
*/

/*
export interface IAuthApi {
  login(data: LoginRequest): Promise<LoginResponse>;
  signUp(data: SignUpRequest): Promise<LoginResponse>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<User | null>;
  isLoggedIn(): Promise<boolean>;
  refresh(): Promise<void>;
}
*/

/*
export interface InstructorAdminResponse {
  name: string;
  email: string;
  createdAt: string;
  onedayClassCount: number;
  sessionCount: number;
  reservationCount: number;
}

export interface IAdminApi {
  getAllInstructors(): Promise<InstructorAdminResponse[]>;
}
*/
