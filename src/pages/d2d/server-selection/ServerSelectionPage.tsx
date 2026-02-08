import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@d2d-ui/ui/button';
import { ThemeToggle } from '@d2d-ui/theme-toggle';
import { Server, Calendar, Megaphone, LogOut } from 'lucide-react';
import { ProfileModal } from '../dashboard/components/ProfileModal';
import { DOMAIN_URL } from '../../../shared/services/api';

interface UserInfo {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  stack: string;
  createdAt: string;
}

export function ServerSelectionPage() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [showProfileModal, setShowProfileModal] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/login');
    } else {
      fetchUserInfo(token);
    }
  }, [navigate]);

  const fetchUserInfo = async (token: string) => {
    try {
      const response = await fetch(`${DOMAIN_URL}/auth/information`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.status && data.body) {
        setUserInfo(data.body);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/login');
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const handleSelection = (type: string) => {
    switch (type) {
      case 'server':
        navigate('/d2d-dashboard');
        break;
      case 'campaigns':
        navigate('/campaigns');
        break;
      case 'headers':
        navigate('/headers');
        break;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="server-selection">
      <header className="server-selection__header">
        <div className="server-selection__header-container">
          <h1 className="server-selection__header-title">D2D Dashboard</h1>

          <div className="server-selection__header-actions">
            <ThemeToggle />
            {userInfo && (
              <>
                <button
                  onClick={() => setShowProfileModal(true)}
                  className="server-selection__header-user"
                >
                  <div className="server-selection__header-avatar">
                    {getInitials(userInfo.firstName, userInfo.lastName)}
                  </div>
                  <div className="server-selection__header-user-info">
                    <div className="server-selection__header-user-name">
                      {userInfo.firstName} {userInfo.lastName}
                    </div>
                    <div className="server-selection__header-user-role">
                      {userInfo.role} / {userInfo.stack}
                    </div>
                  </div>
                </button>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="server-selection__main">
        <div className="server-selection__intro">
          <h2 className="server-selection__intro-title">აირჩიეთ სერვისი</h2>
          <p className="server-selection__intro-subtitle">
            რომელ სერვისთან გსურთ მუშაობა?
          </p>
        </div>

        <div className="server-selection__grid">
          <div
            className="server-selection__card server-selection__card--blue"
            onClick={() => handleSelection('server')}
          >
            <div className="server-selection__card-icon server-selection__card-icon--blue">
              <Server />
            </div>
            <h3 className="server-selection__card-title">აქციების მართვა</h3>
            <p className="server-selection__card-desc">
              აქციების მართვა, deploy-ები და კონფიგურაცია
            </p>
            <div className="server-selection__card-btn server-selection__card-btn--blue">
              გადასვლა
            </div>
          </div>

          <div
            className="server-selection__card server-selection__card--green"
            onClick={() => handleSelection('campaigns')}
          >
            <div className="server-selection__card-icon server-selection__card-icon--green">
              <Calendar />
            </div>
            <h3 className="server-selection__card-title">კამპანიები</h3>
            <p className="server-selection__card-desc">
              აქციის მიმდინარეობები, სტატისტიკა და ანალიტიკა
            </p>
            <div className="server-selection__card-btn server-selection__card-btn--green">
              გადასვლა
            </div>
          </div>

          <div
            className="server-selection__card server-selection__card--purple"
            onClick={() => handleSelection('headers')}
          >
            <div className="server-selection__card-icon server-selection__card-icon--purple">
              <Megaphone />
            </div>
            <h3 className="server-selection__card-title">ჰედერები</h3>
            <p className="server-selection__card-desc">
              ჰედერების მართვა, კონტენტი და დიზაინი
            </p>
            <div className="server-selection__card-btn server-selection__card-btn--purple">
              გადასვლა
            </div>
          </div>
        </div>

        {userInfo && (
          <ProfileModal
            isOpen={showProfileModal}
            onClose={() => setShowProfileModal(false)}
            userInfo={userInfo}
          />
        )}
      </main>
    </div>
  );
}
