import { type MessageTemplateMetadata, type MessageTemplateResponse, type GetTemplateRequest, MessageTemplateResponseTypeEnum } from '../generated';

type MockTemplateKey = 'APPLY_CONFIRMED' | 'D-3' | 'D-1';

const DEFAULT_TEMPLATES: Record<MockTemplateKey, string> = {
  'APPLY_CONFIRMED': `[Class Hub] 신청 완료 안내

안녕하세요, {수강생명}님!
{클래스명} 수업 신청이 완료되었습니다.

▶ 일시: {날짜} {시간}
▶ 장소: {장소}

자세한 내용은 아래 링크를 이용해주세요.
{클래스링크}

감사합니다.`,

  'D-3': `[Class Hub] 수업 3일 전 안내

안녕하세요, {수강생명}님!
신청하신 수업이 3일 후에 진행됩니다.

▶ 수업명: {클래스명}
▶ 일시: {날짜} {시간}
▶ 장소: {장소}

자세한 내용은 아래 링크를 이용해주세요.
{클래스링크}

감사합니다.`,

  'D-1': `[Class Hub] 수업 하루 전 안내

안녕하세요, {수강생명}님!
신청하신 수업이 내일 진행됩니다.

▶ 수업명: {클래스명}
▶ 일시: {날짜} {시간}
▶ 장소: {장소}
▶ 준비물: {준비물}
▶ 주차: {주차}

자세한 내용은 아래 링크를 이용해주세요.
{클래스링크}

감사합니다.`,
};

// ... (DEFAULT_TEMPLATES remains as internal helper)

// export const messageTemplateApiMock: IMessageTemplateApi = {
export const messageTemplateApiMock = {

  async getTemplates(): Promise<MessageTemplateMetadata[]> {
    return [
      { title: '예약 완료 안내', description: '수업 예약 직후 자동으로 발송됩니다' },
      { title: 'D-3 리마인더', description: '수업 3일 전 오전 10시에 자동으로 발송됩니다' },
      { title: 'D-1 리마인더', description: '수업 1일 전 오전 10시에 자동으로 발송됩니다' }
    ];
  },

  async getTemplate(requestParameters: GetTemplateRequest): Promise<MessageTemplateResponse> {
    const { title } = requestParameters;

    // Simple mock mapping
    if (title === '예약 완료 안내') return {
      type: MessageTemplateResponseTypeEnum.AutoApplyConfirmed,
      title,
      description: '수업 예약 직후 자동으로 발송됩니다',
      body: DEFAULT_TEMPLATES['APPLY_CONFIRMED']
    };
    if (title === 'D-3 리마인더') return {
      type: MessageTemplateResponseTypeEnum.AutoReminderD3,
      title,
      description: '수업 3일 전 오전 10시에 자동으로 발송됩니다',
      body: DEFAULT_TEMPLATES['D-3']
    };
    if (title === 'D-1 리마인더') return {
      type: MessageTemplateResponseTypeEnum.AutoReminderD1,
      title,
      description: '수업 1일 전 오전 10시에 자동으로 발송됩니다',
      body: DEFAULT_TEMPLATES['D-1']
    };
    throw new Error('Template not found');
  }
};
