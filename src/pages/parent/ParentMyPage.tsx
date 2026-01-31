import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import MainLayout from '../MainLayout';
import { getMyInfo, updateMyInfo, changePassword } from '../../api/users';

function ParentMyPage() {
  const [userInfo, setUserInfo] = useState({
    name: '',
    loginId: '',
    email: '',
    role: '학부모',
    phone: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    const fetchMyInfo = async () => {
      setIsLoading(true);
      try {
        const response = await getMyInfo();
        const data = response.data;
        const roleName =
          data.role === 'PARENT' ? '학부모' : data.role;
        setUserInfo({
          name: data.name,
          loginId: data.loginId ?? data.email,
          email: data.email,
          role: roleName,
          phone: data.phone,
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : '내 정보를 가져오는데 실패했습니다.';
        alert(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMyInfo();
  }, []);

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updateData = {
        name: editForm.name,
        email: editForm.email,
        phone: editForm.phone,
      };
      const response = await updateMyInfo(updateData);
      alert(response.message);
      setUserInfo({
        ...userInfo,
        name: editForm.name,
        loginId: editForm.email,
        email: editForm.email,
        phone: editForm.phone,
      });
      setIsEditModalOpen(false);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : '내 정보 수정에 실패했습니다.';
      alert(errorMessage);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('새 비밀번호가 일치하지 않습니다.');
      return;
    }
    try {
      const response = await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        newPasswordConfirm: passwordForm.confirmPassword,
      });
      alert(response.message);
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setIsPasswordModalOpen(false);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : '비밀번호 변경에 실패했습니다.';
      alert(errorMessage);
    }
  };

  const openEditModal = () => {
    setEditForm({
      name: userInfo.name,
      email: userInfo.loginId || userInfo.email,
      phone: userInfo.phone,
    });
    setIsEditModalOpen(true);
  };

  return (
    <MainLayout isParent={true}>
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">마이페이지</h1>
      </header>

      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-blue-100/70">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">내 정보</h2>
        {isLoading ? (
          <p className="py-4 text-sm text-slate-500">내 정보를 불러오는 중...</p>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-sm text-slate-600">이름</span>
              <span className="text-sm font-medium text-slate-900">
                {userInfo.name}
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-sm text-slate-600">아이디</span>
              <span className="text-sm font-medium text-slate-900">
                {userInfo.loginId || userInfo.email}
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-sm text-slate-600">연락처</span>
              <span className="text-sm font-medium text-slate-900">
                {userInfo.phone}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">역할</span>
              <span className="text-sm font-medium text-slate-900">
                {userInfo.role}
              </span>
            </div>
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={openEditModal}
            disabled={isLoading}
            className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            수정
          </button>
          <button
            type="button"
            onClick={() => setIsPasswordModalOpen(true)}
            className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            비밀번호 변경
          </button>
        </div>
      </div>

      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">
                정보 수정
              </h3>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  이름
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={e =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  아이디
                </label>
                <input
                  type="text"
                  value={editForm.email}
                  readOnly
                  className="w-full rounded-lg border border-slate-300 bg-slate-100 px-3 py-2 text-sm text-slate-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  연락처
                </label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={e =>
                    setEditForm({ ...editForm, phone: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                >
                  저장
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">
                비밀번호 변경
              </h3>
              <button
                type="button"
                onClick={() => setIsPasswordModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  현재 비밀번호
                </label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={e =>
                    setPasswordForm({
                      ...passwordForm,
                      currentPassword: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  새 비밀번호
                </label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={e =>
                    setPasswordForm({
                      ...passwordForm,
                      newPassword: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  새 비밀번호 확인
                </label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={e =>
                    setPasswordForm({
                      ...passwordForm,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                >
                  변경
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
}

export default ParentMyPage;
