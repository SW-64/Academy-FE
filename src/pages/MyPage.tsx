import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { X } from 'lucide-react';
import MainLayout from './MainLayout';
import { getMyInfo, updateMyInfo, changePassword } from '../api/users';

function MyPage() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const isStudent = !isAdmin;

  // 학교명에서 "고등학교"를 제거하는 함수
  const getSchoolName = (fullSchoolName: string): string => {
    return fullSchoolName.replace('고등학교', '');
  };

  // 학교명에 "고등학교"를 붙이는 함수
  const getFullSchoolName = (schoolName: string): string => {
    return `${schoolName}고등학교`;
  };

  // 사용자 정보 상태
  const [userInfo, setUserInfo] = useState({
    name: '',
    email: '',
    school: '',
    grade: '',
    role: '',
    phone: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  // 모달 상태
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // 수정 폼 상태 (학교는 학교명만 저장)
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    school: '',
    grade: '',
  });

  // 비밀번호 변경 폼 상태
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // 내 정보 조회 API 호출
  useEffect(() => {
    const fetchMyInfo = async () => {
      setIsLoading(true);
      try {
        const response = await getMyInfo();
        const data = response.data;

        // 역할에 따른 표시 이름 변환
        const roleName =
          data.role === 'ADMIN'
            ? '관리자'
            : data.role === 'STUDENT'
            ? '학생'
            : data.role === 'PARENT'
            ? '학부모'
            : data.role;

        setUserInfo({
          name: data.name,
          email: data.email,
          phone: data.phone,
          school: data.signupSchool || '',
          grade: data.signupGrade ? `${data.signupGrade}학년` : '',
          role: roleName,
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
      // API 요청 데이터 구성
      const updateData: {
        name?: string;
        email?: string;
        phone?: string;
        school?: string;
        grade?: number;
      } = {
        name: editForm.name,
        email: editForm.email,
        phone: editForm.phone,
      };

      // 학생인 경우 학교와 학년 추가
      if (isStudent) {
        if (editForm.school) {
          updateData.school = getFullSchoolName(editForm.school);
        }
        if (editForm.grade) {
          const gradeNumber = parseInt(editForm.grade.replace('학년', ''), 10);
          if (!isNaN(gradeNumber)) {
            updateData.grade = gradeNumber;
          }
        }
      }

      const response = await updateMyInfo(updateData);
      alert(response.message);

      // userInfo 업데이트
      setUserInfo({
        ...userInfo,
        name: editForm.name,
        email: editForm.email,
        phone: editForm.phone,
        school: isStudent
          ? getFullSchoolName(editForm.school)
          : userInfo.school,
        grade: isStudent ? editForm.grade : userInfo.grade,
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

    // 클라이언트 측 검증
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
      email: userInfo.email,
      phone: userInfo.phone,
      school: isStudent ? getSchoolName(userInfo.school) : '',
      grade: isStudent ? userInfo.grade : '',
    });
    setIsEditModalOpen(true);
  };

  return (
    <MainLayout>
      {/* 헤더 */}
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">마이페이지</h1>
      </header>

      {/* 사용자 정보 카드 */}
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-blue-100/70">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">내 정보</h2>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-sm text-slate-600">내 정보를 불러오는 중...</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-sm text-slate-600">이름</span>
              <span className="text-sm font-medium text-slate-900">
                {userInfo.name}
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-sm text-slate-600">이메일</span>
              <span className="text-sm font-medium text-slate-900">
                {userInfo.email}
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-sm text-slate-600">연락처</span>
              <span className="text-sm font-medium text-slate-900">
                {userInfo.phone}
              </span>
            </div>
            {isStudent && (
              <>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-sm text-slate-600">학교</span>
                  <span className="text-sm font-medium text-slate-900">
                    {userInfo.school}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-sm text-slate-600">학년</span>
                  <span className="text-sm font-medium text-slate-900">
                    {userInfo.grade}
                  </span>
                </div>
              </>
            )}
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">역할</span>
              <span className="text-sm font-medium text-slate-900">
                {userInfo.role}
              </span>
            </div>
          </div>
        )}

        {/* 버튼 영역 */}
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={openEditModal}
            className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
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

      {/* 수정 모달 */}
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
                  이메일
                </label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={e =>
                    setEditForm({ ...editForm, email: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
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
              {isStudent && (
                <>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      학교
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editForm.school}
                        onChange={e =>
                          setEditForm({ ...editForm, school: e.target.value })
                        }
                        className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        required
                      />
                      <span className="text-sm font-medium text-slate-700">
                        고등학교
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      학년
                    </label>
                    <select
                      value={editForm.grade}
                      onChange={e =>
                        setEditForm({ ...editForm, grade: e.target.value })
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      required
                    >
                      <option value="">학년을 선택하세요</option>
                      <option value="1학년">1학년</option>
                      <option value="2학년">2학년</option>
                      <option value="3학년">3학년</option>
                    </select>
                  </div>
                </>
              )}
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

      {/* 비밀번호 변경 모달 */}
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

export default MyPage;
