import React from 'react';
import { AlertCircle } from 'lucide-react';

const AdminNotification = ({ uiLang }) => {
  // Вы можете менять эти сообщения прямо здесь
  const notifications = {
    ru: {
      title: 'Уведомление от Администрации',
      message: 'Мы обновили мобильное приложение! Теперь прошедшие события автоматически скрываются с карты, делая её чище. Пожалуйста, убедитесь, что ваши даты событий заполнены корректно.',
      date: '17 мая 2026'
    },
    en: {
      title: 'Notification from Administration',
      message: 'We have updated the mobile app! Now past events are automatically hidden from the map to keep it clean. Please make sure your event dates are set correctly.',
      date: 'May 17, 2026'
    },
    vi: {
      title: 'Thông báo từ Ban quản trị',
      message: 'Chúng tôi đã cập nhật ứng dụng di động! Bây giờ các sự kiện đã qua sẽ tự động ẩn khỏi bản đồ để giữ bản đồ sạch sẽ. Vui lòng đảm bảo ngày diễn ra sự kiện được đặt chính xác.',
      date: '17 tháng 5, 2026'
    },
    ko: {
      title: '관리자 공지사항',
      message: '모바일 앱이 업데이트되었습니다! 이제 지난 이벤트는 지도에서 자동으로 숨겨집니다. 이벤트 날짜가 올바르게 설정되어 있는지 확인해 주세요.',
      date: '2026년 5월 17일'
    },
    zh: {
      title: '来自管理处的通知',
      message: '我们更新了移动应用！现在过去的时间将自动从地图上隐藏。请确保您的活动日期设置正确。',
      date: '2026年5月17日'
    }
  };

  const current = notifications[uiLang] || notifications.en;

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(212,161,23,0.15) 0%, rgba(212,161,23,0.03) 100%)',
      border: '1px solid rgba(212,161,23,0.3)',
      borderRadius: '16px',
      padding: '16px',
      marginBottom: '20px',
      display: 'flex',
      gap: '14px',
      alignItems: 'flex-start',
      boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)',
      backdropFilter: 'blur(4px)',
      animation: 'slideDown 0.3s ease-out'
    }}>
      <div style={{
        background: 'rgba(212,161,23,0.2)',
        borderRadius: '12px',
        padding: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--accent-gold)'
      }}>
        <AlertCircle size={22} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap', gap: '8px' }}>
          <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 900, color: 'var(--accent-gold)', letterSpacing: '0.5px' }}>
            {current.title}
          </h3>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600 }}>
            {current.date}
          </span>
        </div>
        <p style={{ margin: 0, fontSize: '12.5px', color: 'rgba(255,255,255,0.85)', lineHeight: '1.6', fontWeight: 500 }}>
          {current.message}
        </p>
      </div>
    </div>
  );
};

export default AdminNotification;
