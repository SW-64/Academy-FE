import { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import MainLayout from '../MainLayout';
import { getStudents, getStudentDetail } from '../../api/students';
import { getParents, getParentDetail } from '../../api/parents';
import {
  rejectUser,
  approveUser,
  getPendingUsers,
  getBlacklistUsers,
  unblacklistUser,
  updateUserInfo,
  type PendingUser,
  type BlacklistUser,
} from '../../api/users';

// 빈 데이터
const initialStudents: Student[] = [];
const initialParents: Parent[] = [];

type TabType = 'students' | 'parents' | 'pending' | 'blacklist';

type Student = {
  id: number;
  userId?: number; // 유저 거절 API를 위해 필요
  name: string;
  email: string;
  phone: string;
  school: string;
  grade: string;
};

type Parent = {
  id: number;
  userId?: number; // 유저 거절 API를 위해 필요
  name: string;
  email: string;
  phone: string;
  linkedStudent: string;
};

function AdminPage() {
  const [activeTab, setActiveTab] = useState<TabType>('students');
  const [showCalendar, setShowCalendar] = useState(false);
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [blacklistUsers, setBlacklistUsers] = useState<BlacklistUser[]>([]);
  const [isLoadingPending, setIsLoadingPending] = useState(false);
  const [isLoadingBlacklist, setIsLoadingBlacklist] = useState(false);
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [parents, setParents] = useState<Parent[]>(initialParents);
  const [studentPage, setStudentPage] = useState(1);
  const [parentPage, setParentPage] = useState(1);
  const itemsPerPage = 10;

  // 데이터 캐싱 (불필요한 API 호출 방지)
  const dataCacheRef = useRef<{
    students?: { data: Student[]; meta: typeof studentsMeta; page: number };
    parents?: { data: Parent[]; meta: typeof parentsMeta; page: number };
    pending?: PendingUser[];
    blacklist?: BlacklistUser[];
  }>({});
  const [studentsMeta, setStudentsMeta] = useState<{
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  } | null>(null);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [parentsMeta, setParentsMeta] = useState<{
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  } | null>(null);
  const [isLoadingParents, setIsLoadingParents] = useState(false);

  // 캘린더 표시 여부 설정 (너비 1350px 이상일 때 표시)
  useEffect(() => {
    const handleResize = () => {
      setShowCalendar(window.innerWidth >= 1350);
    };

    handleResize(); // 초기 체크
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 탭 변경 시 페이지 리셋
  useEffect(() => {
    setStudentPage(1);
    setParentPage(1);
  }, [activeTab]);

  // 학생 관리 탭 활성화 시 학생 목록 조회 (캐싱 적용)
  useEffect(() => {
    if (activeTab === 'students') {
      // 캐시 확인
      const cached = dataCacheRef.current.students;
      if (cached && cached.page === studentPage) {
        setStudents(cached.data);
        setStudentsMeta(cached.meta);
        return;
      }

      const fetchStudents = async () => {
        setIsLoadingStudents(true);
        try {
          const response = await getStudents(studentPage, itemsPerPage);
          // API 응답을 Student 형식으로 변환 (student가 null인 항목은 제외)
          const transformedStudents: Student[] = response.data.items
            .filter(item => item.student != null)
            .map(item => ({
              id: item.student!.studentId,
              userId: item.userId,
              name: item.name,
              email: item.email,
              phone: item.phone,
              school: item.student!.school,
              grade: `${item.student!.grade}학년`,
            }));
          setStudents(transformedStudents);
          setStudentsMeta(response.data.meta);
          // 캐시 저장
          dataCacheRef.current.students = {
            data: transformedStudents,
            meta: response.data.meta,
            page: studentPage,
          };
        } catch (error) {
          console.error('학생 목록 조회 에러:', error);
          setStudents([]);
          setStudentsMeta(null);
        } finally {
          setIsLoadingStudents(false);
        }
      };

      fetchStudents();
    }
  }, [activeTab, studentPage, itemsPerPage]);

  // 학부모 관리 탭 활성화 시 학부모 목록 조회 (캐싱 적용)
  useEffect(() => {
    if (activeTab === 'parents') {
      // 캐시 확인
      const cached = dataCacheRef.current.parents;
      if (cached && cached.page === parentPage) {
        setParents(cached.data);
        setParentsMeta(cached.meta);
        return;
      }

      const fetchParents = async () => {
        setIsLoadingParents(true);
        try {
          const response = await getParents(parentPage, itemsPerPage);
          // API 응답을 Parent 형식으로 변환
          const transformedParents: Parent[] = response.data.items.map(
            item => ({
              id: item.parent.parentId,
              userId: item.userId,
              name: item.name,
              email: item.email,
              phone: item.phone,
              linkedStudent:
                item.parent.student.length > 0
                  ? item.parent.student.map(s => s.user.name).join(', ')
                  : '-',
            })
          );
          setParents(transformedParents);
          setParentsMeta(response.data.meta);
          // 캐시 저장
          dataCacheRef.current.parents = {
            data: transformedParents,
            meta: response.data.meta,
            page: parentPage,
          };
        } catch (error) {
          console.error('학부모 목록 조회 에러:', error);
          setParents([]);
          setParentsMeta(null);
        } finally {
          setIsLoadingParents(false);
        }
      };

      fetchParents();
    }
  }, [activeTab, parentPage, itemsPerPage]);

  // 미승인 유저 탭 활성화 시 미승인 유저 목록 조회 (캐싱 적용)
  useEffect(() => {
    if (activeTab === 'pending') {
      // 캐시 확인
      if (dataCacheRef.current.pending) {
        setPendingUsers(dataCacheRef.current.pending);
        return;
      }

      const fetchPendingUsers = async () => {
        setIsLoadingPending(true);
        try {
          const response = await getPendingUsers();
          setPendingUsers(response.data.items);
          // 캐시 저장
          dataCacheRef.current.pending = response.data.items;
        } catch (error) {
          console.error('승인 대기 유저 목록 조회 에러:', error);
          setPendingUsers([]);
        } finally {
          setIsLoadingPending(false);
        }
      };

      fetchPendingUsers();
    }
  }, [activeTab]);

  // 블랙리스트 탭 활성화 시 블랙리스트 유저 목록 조회 (캐싱 적용)
  useEffect(() => {
    if (activeTab === 'blacklist') {
      // 캐시 확인
      if (dataCacheRef.current.blacklist) {
        setBlacklistUsers(dataCacheRef.current.blacklist);
        return;
      }

      const fetchBlacklistUsers = async () => {
        setIsLoadingBlacklist(true);
        try {
          const response = await getBlacklistUsers();
          setBlacklistUsers(response.data.items);
          // 캐시 저장
          dataCacheRef.current.blacklist = response.data.items;
        } catch (error) {
          console.error('블랙리스트 유저 목록 조회 에러:', error);
          setBlacklistUsers([]);
        } finally {
          setIsLoadingBlacklist(false);
        }
      };

      fetchBlacklistUsers();
    }
  }, [activeTab]);

  // 수정 모달 상태
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [editingParent, setEditingParent] = useState<Parent | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    school: '',
    phone: '',
    grade: '',
  });
  const [editParentForm, setEditParentForm] = useState({
    name: '',
    phone: '',
    linkedStudent: '',
  });

  // 학생-부모 연동 관계 (학생 ID -> 부모 ID, 1명만 가능)
  const [studentParentLinks, setStudentParentLinks] = useState<
    Record<number, number>
  >({});

  // 부모 검색 상태
  const [parentSearchQuery, setParentSearchQuery] = useState('');

  // 검색 결과 상태 (검색 버튼을 눌렀을 때만 표시)
  const [searchResults, setSearchResults] = useState<Parent[]>([]);

  // 검색 실행 여부
  const [hasSearched, setHasSearched] = useState(false);

  // 삭제 확인 모달 상태
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);
  const [deletingParent, setDeletingParent] = useState<Parent | null>(null);

  const handleApprove = async (userId: number) => {
    try {
      const response = await approveUser(userId);
      alert(response.message);
      // 캐시 무효화 및 목록 새로고침
      dataCacheRef.current.pending = undefined;
      const fetchPendingUsers = async () => {
        setIsLoadingPending(true);
        try {
          const response = await getPendingUsers();
          setPendingUsers(response.data.items);
          // 캐시 저장
          dataCacheRef.current.pending = response.data.items;
        } catch (error) {
          console.error('승인 대기 유저 목록 조회 에러:', error);
          setPendingUsers([]);
        } finally {
          setIsLoadingPending(false);
        }
      };
      fetchPendingUsers();
    } catch (error) {
      console.error('유저 계정 승인 에러:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : '유저 계정 승인에 실패했습니다.';
      alert(errorMessage);
    }
  };

  const handleReject = async (userId: number) => {
    if (confirm('정말 이 유저의 가입 신청을 거절하시겠습니까?')) {
      try {
        const response = await rejectUser(userId);
        alert(response.message);
        // 캐시 무효화 및 목록 새로고침
        dataCacheRef.current.pending = undefined;
        const fetchPendingUsers = async () => {
          setIsLoadingPending(true);
          try {
            const response = await getPendingUsers();
            setPendingUsers(response.data.items);
            // 캐시 저장
            dataCacheRef.current.pending = response.data.items;
          } catch (error) {
            console.error('승인 대기 유저 목록 조회 에러:', error);
            setPendingUsers([]);
          } finally {
            setIsLoadingPending(false);
          }
        };
        fetchPendingUsers();
      } catch (error) {
        console.error('유저 계정 거절 에러:', error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : '유저 계정 거절에 실패했습니다.';
        alert(errorMessage);
      }
    }
  };

  const handleRestore = async (userId: number) => {
    if (confirm('정말 이 유저를 블랙리스트에서 복구하시겠습니까?')) {
      try {
        const response = await unblacklistUser(userId);
        alert(response.message);
        // 캐시 무효화 및 목록 새로고침
        dataCacheRef.current.blacklist = undefined;
        const fetchBlacklistUsers = async () => {
          setIsLoadingBlacklist(true);
          try {
            const response = await getBlacklistUsers();
            setBlacklistUsers(response.data.items);
            // 캐시 저장
            dataCacheRef.current.blacklist = response.data.items;
          } catch (error) {
            console.error('블랙리스트 유저 목록 조회 에러:', error);
            setBlacklistUsers([]);
          } finally {
            setIsLoadingBlacklist(false);
          }
        };
        fetchBlacklistUsers();
      } catch (error) {
        console.error('블랙리스트 복구 에러:', error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : '블랙리스트 복구에 실패했습니다.';
        alert(errorMessage);
      }
    }
  };

  const handleEditStudent = async (student: Student) => {
    // 학생 상세 조회 API 호출
    try {
      const response = await getStudentDetail(student.id);
      const studentData = response.data;

      // API 응답을 Student 형식으로 변환하여 저장
      const transformedStudent: Student = {
        id: studentData.studentId,
        userId: studentData.user.userId, // userId 추가 (API 호출에 필요)
        name: studentData.user.name,
        email: studentData.user.email,
        phone: studentData.user.phone,
        school: studentData.school,
        grade: `${studentData.grade}학년`,
      };

      setEditingStudent(transformedStudent);
      setParentSearchQuery(''); // 검색어 초기화
      setSearchResults([]); // 검색 결과 초기화
      setHasSearched(false); // 검색 여부 초기화

      // 학교 이름에서 "고등학교" 제거한 앞부분만 추출
      const schoolName = studentData.school.replace('고등학교', '');
      // 연락처에서 '-' 제거
      const phoneWithoutDash = studentData.user.phone.replace(/-/g, '');
      // 학년에서 숫자만 추출
      const gradeNumber = String(studentData.grade);

      setEditForm({
        name: studentData.user.name,
        school: schoolName,
        phone: phoneWithoutDash,
        grade: gradeNumber,
      });
      setEditModalOpen(true);
    } catch (error) {
      console.error('학생 상세 조회 에러:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : '학생 정보를 가져오는데 실패했습니다.';
      alert(errorMessage);
    }
  };

  const handleSaveEdit = async () => {
    try {
      if (editingStudent && editingStudent.userId) {
        // 학생 정보 수정 API 호출 (학부모와 동일한 API 사용)
        const updateData: {
          name?: string;
          email?: string;
          phone?: string;
          school?: string;
          grade?: number;
        } = {};

        if (editForm.name) updateData.name = editForm.name;
        if (editForm.phone && editForm.phone.length === 11) {
          updateData.phone = editForm.phone;
        }
        if (editForm.school) {
          updateData.school = `${editForm.school}고등학교`;
        }
        if (editForm.grade) {
          updateData.grade = parseInt(editForm.grade, 10);
        }

        const response = await updateUserInfo(
          editingStudent.userId,
          updateData
        );
        alert(response.message);

        // 캐시 무효화 및 목록 새로고침
        dataCacheRef.current.students = undefined;
        const fetchStudents = async () => {
          setIsLoadingStudents(true);
          try {
            const response = await getStudents(studentPage, itemsPerPage);
            const transformedStudents: Student[] = response.data.items
              .filter(item => item.student != null)
              .map(item => ({
                id: item.student!.studentId,
                userId: item.userId,
                name: item.name,
                email: item.email,
                phone: item.phone,
                school: item.student!.school,
                grade: `${item.student!.grade}학년`,
              }));
            setStudents(transformedStudents);
            setStudentsMeta(response.data.meta);
            // 캐시 저장
            dataCacheRef.current.students = {
              data: transformedStudents,
              meta: response.data.meta,
              page: studentPage,
            };
          } catch (error) {
            console.error('학생 목록 조회 에러:', error);
            setStudents([]);
            setStudentsMeta(null);
          } finally {
            setIsLoadingStudents(false);
          }
        };
        fetchStudents();

        setEditingStudent(null);
      }
      if (editingParent && editingParent.userId) {
        // 학부모 정보 수정 API 호출
        const updateData: {
          name?: string;
          email?: string;
          phone?: string;
        } = {};

        if (editParentForm.name) updateData.name = editParentForm.name;
        if (editParentForm.phone && editParentForm.phone.length === 11) {
          updateData.phone = editParentForm.phone;
        }

        const response = await updateUserInfo(editingParent.userId, updateData);
        alert(response.message);

        // 캐시 무효화 및 목록 새로고침
        dataCacheRef.current.parents = undefined;
        const fetchParents = async () => {
          setIsLoadingParents(true);
          try {
            const response = await getParents(parentPage, itemsPerPage);
            const transformedParents: Parent[] = response.data.items.map(
              item => ({
                id: item.parent.parentId,
                userId: item.userId,
                name: item.name,
                email: item.email,
                phone: item.phone,
                linkedStudent:
                  item.parent.student.length > 0
                    ? item.parent.student.map(s => s.user.name).join(', ')
                    : '-',
              })
            );
            setParents(transformedParents);
            setParentsMeta(response.data.meta);
            // 캐시 저장
            dataCacheRef.current.parents = {
              data: transformedParents,
              meta: response.data.meta,
              page: parentPage,
            };
          } catch (error) {
            console.error('학부모 목록 조회 에러:', error);
            setParents([]);
            setParentsMeta(null);
          } finally {
            setIsLoadingParents(false);
          }
        };
        fetchParents();

        setEditingParent(null);
      }
      setEditModalOpen(false);
    } catch (error) {
      console.error('유저 정보 수정 에러:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : '유저 정보 수정에 실패했습니다.';
      alert(errorMessage);
    }
  };

  const handleEditParent = async (parent: Parent) => {
    // 학부모 상세 조회 API 호출
    try {
      const response = await getParentDetail(parent.id);
      const parentData = response.data;

      // API 응답을 Parent 형식으로 변환하여 저장
      const transformedParent: Parent = {
        id: parentData.parentId,
        userId: parentData.user.userId,
        name: parentData.user.name,
        email: parentData.user.email,
        phone: parentData.user.phone,
        linkedStudent:
          parentData.student.length > 0
            ? parentData.student.map(s => s.user.name).join(', ')
            : '-',
      };

      setEditingParent(transformedParent);
      // 연동 학생 이름 처리: 없으면 빈 문자열, 있으면 이름만
      const linkedStudentNames =
        parentData.student.length > 0
          ? parentData.student.map(s => s.user.name).join(', ')
          : '';

      setEditParentForm({
        name: parentData.user.name,
        phone: parentData.user.phone,
        linkedStudent: linkedStudentNames,
      });
      setEditModalOpen(true);
    } catch (error) {
      console.error('학부모 상세 조회 에러:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : '학부모 정보를 가져오는데 실패했습니다.';
      alert(errorMessage);
    }
  };

  const handleDeleteStudent = (student: Student) => {
    setDeletingStudent(student);
    setDeleteModalOpen(true);
  };

  const handleDeleteParent = (parent: Parent) => {
    setDeletingParent(parent);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      if (deletingStudent && deletingStudent.userId) {
        // 유저 계정 거절 API 호출
        const response = await rejectUser(deletingStudent.userId);
        alert(response.message);
        // 목록에서 제거
        setStudents(prev => prev.filter(s => s.id !== deletingStudent.id));
        setDeletingStudent(null);
      }
      if (deletingParent && deletingParent.userId) {
        // 유저 계정 거절 API 호출
        const response = await rejectUser(deletingParent.userId);
        alert(response.message);
        // 목록에서 제거
        setParents(prev => prev.filter(p => p.id !== deletingParent.id));
        setDeletingParent(null);
      }
      setDeleteModalOpen(false);
    } catch (error) {
      console.error('유저 계정 거절 에러:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : '유저 계정 거절에 실패했습니다.';
      alert(errorMessage);
    }
  };

  const handleResetPassword = () => {
    if (confirm('정말 초기화할까요?')) {
      // 실제 비밀번호 초기화 로직은 여기에 구현
      // eslint-disable-next-line no-alert
      alert(
        editingStudent
          ? `${editingStudent.name} 학생의 비밀번호가 초기화되었습니다. (데모)`
          : `${editingParent?.name} 학부모의 비밀번호가 초기화되었습니다. (데모)`
      );
    }
  };

  // 부모 검색 함수 (검색 버튼 클릭 시 실행)
  const handleSearchParents = () => {
    if (!editingStudent) return;

    const linkedParentId = studentParentLinks[editingStudent.id];
    const query = parentSearchQuery.trim().toLowerCase();

    // 검색어가 있으면 필터링, 없으면 모든 부모 표시
    const filtered = parents.filter(parent => {
      // 이미 연동된 부모는 제외
      if (linkedParentId && parent.id === linkedParentId) {
        return false;
      }
      // 검색어 필터링
      if (query) {
        return (
          parent.name.toLowerCase().includes(query) ||
          parent.email.toLowerCase().includes(query)
        );
      }
      return true;
    });

    setSearchResults(filtered);
    setHasSearched(true);
  };

  return (
    <MainLayout showCalendar={showCalendar} isAdmin={true}>
      {/* 헤더 */}
      <header className="mb-6">
        <div className="mb-2">
          <h1 className="text-2xl font-semibold text-slate-900">학생 관리</h1>
        </div>
      </header>

      {/* 탭 */}
      <div className="mb-6 flex gap-2 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('students')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'students'
              ? 'border-b-2 border-[#084773] text-[#084773]'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          학생 관리
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('parents')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'parents'
              ? 'border-b-2 border-[#084773] text-[#084773]'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          학부모 관리
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'pending'
              ? 'border-b-2 border-[#084773] text-[#084773]'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          미승인된 유저
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('blacklist')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'blacklist'
              ? 'border-b-2 border-red-600 text-red-600'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          블랙리스트
        </button>
      </div>

      {/* 학생 관리 탭 */}
      {activeTab === 'students' && (
        <div className="space-y-6">
          <section>
            <h2 className="mb-4 text-lg font-semibold text-slate-900">
              전체 학생 목록
            </h2>
            <div className="overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-blue-100/70">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                      이름
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                      이메일
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                      학교
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                      연락처
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                      학년
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                      연동된 학부모
                    </th>
                    <th className="pl-4 pr-6 py-3 text-right text-sm font-semibold text-slate-900">
                      관리
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {isLoadingStudents ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-8 text-center text-sm text-slate-500"
                      >
                        학생 목록을 불러오는 중...
                      </td>
                    </tr>
                  ) : students.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-8 text-center text-sm text-slate-500"
                      >
                        등록된 학생이 없습니다.
                      </td>
                    </tr>
                  ) : (
                    students.map(student => (
                      <tr
                        key={student.id}
                        className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                      >
                        <td className="px-4 py-3 text-sm text-slate-900">
                          {student.name}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {student.email}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {student.school}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {student.phone}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {student.grade}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {(() => {
                            const linkedParentId =
                              studentParentLinks[student.id];
                            if (!linkedParentId) {
                              return <span className="text-slate-400">-</span>;
                            }
                            const linkedParent = parents.find(
                              p => p.id === linkedParentId
                            );
                            return linkedParent ? (
                              <span>{linkedParent.name}</span>
                            ) : (
                              <span className="text-slate-400">-</span>
                            );
                          })()}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleEditStudent(student)}
                              className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-100"
                            >
                              수정
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteStudent(student)}
                              className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-100"
                            >
                              삭제
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {/* 학생 페이지네이션 */}
            {studentsMeta && (
              <div className="mt-6 flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setStudentPage(prev => Math.max(1, prev - 1))}
                  disabled={studentPage === 1}
                  className="flex items-center justify-center rounded-lg border border-slate-300 p-2 text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {Array.from(
                  { length: studentsMeta.totalPages },
                  (_, i) => i + 1
                ).map(page => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setStudentPage(page)}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                      studentPage === page
                        ? 'bg-[#084773] text-white'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    setStudentPage(prev =>
                      Math.min(studentsMeta.totalPages, prev + 1)
                    )
                  }
                  disabled={studentPage === studentsMeta.totalPages}
                  className="flex items-center justify-center rounded-lg border border-slate-300 p-2 text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </section>
        </div>
      )}

      {/* 학부모 관리 탭 */}
      {activeTab === 'parents' && (
        <div className="space-y-6">
          <section>
            <h2 className="mb-4 text-lg font-semibold text-slate-900">
              전체 학부모 목록
            </h2>
            <div className="overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-blue-100/70">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                      이름
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                      이메일
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                      연락처
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                      연동 학생
                    </th>
                    <th className="pl-4 pr-6 py-3 text-right text-sm font-semibold text-slate-900">
                      관리
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {isLoadingParents ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-8 text-center text-sm text-slate-500"
                      >
                        학부모 목록을 불러오는 중...
                      </td>
                    </tr>
                  ) : parents.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-8 text-center text-sm text-slate-500"
                      >
                        등록된 학부모가 없습니다.
                      </td>
                    </tr>
                  ) : (
                    parents.map(parent => (
                      <tr
                        key={parent.id}
                        className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                      >
                        <td className="px-4 py-3 text-sm text-slate-900">
                          {parent.name}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {parent.email}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {parent.phone}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {parent.linkedStudent}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleEditParent(parent)}
                              className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-100"
                            >
                              수정
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteParent(parent)}
                              className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-100"
                            >
                              삭제
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {/* 학부모 페이지네이션 */}
            {parentsMeta && (
              <div className="mt-6 flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setParentPage(prev => Math.max(1, prev - 1))}
                  disabled={parentPage === 1}
                  className="flex items-center justify-center rounded-lg border border-slate-300 p-2 text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {Array.from(
                  { length: parentsMeta.totalPages },
                  (_, i) => i + 1
                ).map(page => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setParentPage(page)}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                      parentPage === page
                        ? 'bg-[#084773] text-white'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    setParentPage(prev =>
                      Math.min(parentsMeta.totalPages, prev + 1)
                    )
                  }
                  disabled={parentPage === parentsMeta.totalPages}
                  className="flex items-center justify-center rounded-lg border border-slate-300 p-2 text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </section>
        </div>
      )}

      {/* 미승인된 유저 탭 */}
      {activeTab === 'pending' && (
        <div className="space-y-6">
          <section>
            <h2 className="mb-4 text-lg font-semibold text-slate-900">
              미승인된 유저
            </h2>
            <div className="overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-blue-100/70">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                      이름
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                      이메일
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                      역할
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                      신청일
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-slate-900">
                      처리
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {isLoadingPending ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-8 text-center text-sm text-slate-500"
                      >
                        미승인 유저 목록을 불러오는 중...
                      </td>
                    </tr>
                  ) : pendingUsers.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-8 text-center text-sm text-slate-500"
                      >
                        미승인된 유저가 없습니다.
                      </td>
                    </tr>
                  ) : (
                    pendingUsers.map(user => (
                      <tr
                        key={user.userId}
                        className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                      >
                        <td className="px-4 py-3 text-sm text-slate-900">
                          {user.name}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {user.email}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {user.role === 'STUDENT' ? '학생' : '학부모'}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {new Date(user.createdAt).toLocaleDateString('ko-KR')}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleApprove(user.userId)}
                              className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-100"
                            >
                              승인
                            </button>
                            <button
                              type="button"
                              onClick={() => handleReject(user.userId)}
                              className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-100"
                            >
                              거절
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {/* 블랙리스트 탭 */}
      {activeTab === 'blacklist' && (
        <div className="space-y-6">
          <section>
            <h2 className="mb-4 text-lg font-semibold text-slate-900">
              블랙리스트
            </h2>
            <div className="overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-red-100/70">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                      이름
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                      이메일
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                      역할
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                      신청일
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-slate-900">
                      처리
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {isLoadingBlacklist ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-8 text-center text-sm text-slate-500"
                      >
                        블랙리스트 유저 목록을 불러오는 중...
                      </td>
                    </tr>
                  ) : blacklistUsers.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-8 text-center text-sm text-slate-500"
                      >
                        블랙리스트에 등록된 유저가 없습니다.
                      </td>
                    </tr>
                  ) : (
                    blacklistUsers.map(user => (
                      <tr
                        key={user.userId}
                        className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                      >
                        <td className="px-4 py-3 text-sm text-slate-900">
                          {user.name}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {user.email}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {user.role === 'STUDENT' ? '학생' : '학부모'}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {new Date(user.createdAt).toLocaleDateString('ko-KR')}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleRestore(user.userId)}
                              className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-100"
                            >
                              복구
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {/* 수정 모달 */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div
            className={`relative w-full max-w-3xl flex flex-col rounded-2xl bg-white shadow-xl overflow-hidden ${
              editingStudent
                ? 'h-[95vh] max-h-[900px]'
                : 'h-[70vh] max-h-[600px]'
            }`}
            onClick={e => e.stopPropagation()}
          >
            {/* 헤더 (고정) */}
            <div className="flex-shrink-0 flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-200">
              <h2 className="text-xl font-semibold text-slate-900">
                {editingStudent ? '학생 정보 수정' : '학부모 정보 수정'}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setEditModalOpen(false);
                  setEditingStudent(null);
                  setEditingParent(null);
                }}
                className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* 본문 (스크롤 가능) */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
              {/* 정보 수정 섹션 */}
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <h3 className="mb-4 text-base font-semibold text-slate-900">
                  정보 수정
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      이름
                    </label>
                    <input
                      type="text"
                      value={
                        editingStudent ? editForm.name : editParentForm.name
                      }
                      onChange={e =>
                        editingStudent
                          ? setEditForm({ ...editForm, name: e.target.value })
                          : setEditParentForm({
                              ...editParentForm,
                              name: e.target.value,
                            })
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#084773] focus:outline-none focus:ring-1 focus:ring-[#084773]"
                    />
                  </div>

                  {editingStudent ? (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          학교
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={editForm.school}
                            onChange={e =>
                              setEditForm({
                                ...editForm,
                                school: e.target.value,
                              })
                            }
                            className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#084773] focus:outline-none focus:ring-1 focus:ring-[#084773]"
                            placeholder="학교명 앞부분"
                          />
                          <span className="text-sm text-slate-600 whitespace-nowrap">
                            고등학교
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          연락처
                        </label>
                        <input
                          type="text"
                          value={editForm.phone}
                          onChange={e => {
                            // 숫자만 입력 허용
                            const value = e.target.value.replace(/[^0-9]/g, '');
                            // 최대 11자리로 제한 (01012345678)
                            if (value.length <= 11) {
                              setEditForm({ ...editForm, phone: value });
                            }
                          }}
                          placeholder="01012345678"
                          maxLength={11}
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#084773] focus:outline-none focus:ring-1 focus:ring-[#084773]"
                        />
                        {editForm.phone && (
                          <p className="mt-1 text-xs text-slate-500">
                            {editForm.phone.length < 11
                              ? `${editForm.phone.length}자 입력됨 (11자 필요)`
                              : editForm.phone.replace(
                                  /(\d{3})(\d{4})(\d{4})/,
                                  '$1-$2-$3'
                                )}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          학년
                        </label>
                        <select
                          value={editForm.grade}
                          onChange={e =>
                            setEditForm({ ...editForm, grade: e.target.value })
                          }
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#084773] focus:outline-none focus:ring-1 focus:ring-[#084773]"
                        >
                          <option value="">학년 선택</option>
                          <option value="1">1학년</option>
                          <option value="2">2학년</option>
                          <option value="3">3학년</option>
                        </select>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          연락처
                        </label>
                        <input
                          type="text"
                          value={editParentForm.phone}
                          onChange={e =>
                            setEditParentForm({
                              ...editParentForm,
                              phone: e.target.value,
                            })
                          }
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#084773] focus:outline-none focus:ring-1 focus:ring-[#084773]"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* 부모 연동 섹션 (학생만) */}
              {editingStudent && (
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                  <h3 className="mb-4 text-base font-semibold text-blue-900">
                    부모 연동
                  </h3>

                  {/* 연동된 부모 목록 */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      연동된 부모
                    </label>
                    <div className="h-20 overflow-y-auto rounded-lg border border-slate-200 bg-white">
                      {(() => {
                        const linkedParentId =
                          studentParentLinks[editingStudent.id];

                        if (!linkedParentId) {
                          return (
                            <div className="h-full flex items-center justify-center">
                              <div className="text-sm text-slate-400">
                                연동된 부모가 없습니다.
                              </div>
                            </div>
                          );
                        }

                        const linkedParent = parents.find(
                          p => p.id === linkedParentId
                        );

                        if (!linkedParent) {
                          return (
                            <div className="h-full flex items-center justify-center">
                              <div className="text-sm text-slate-400">
                                연동된 부모가 없습니다.
                              </div>
                            </div>
                          );
                        }

                        return (
                          <div className="divide-y divide-slate-200">
                            <div className="flex items-center justify-between px-3 py-2 hover:bg-slate-50">
                              <div className="flex-1">
                                <div className="text-sm font-medium text-slate-900">
                                  {linkedParent.name}
                                </div>
                                <div className="text-xs text-slate-500">
                                  {linkedParent.email} | {linkedParent.phone}
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setStudentParentLinks(prev => {
                                    const newLinks = { ...prev };
                                    delete newLinks[editingStudent.id];
                                    return newLinks;
                                  });
                                }}
                                className="ml-2 rounded-lg border border-red-300 bg-red-50 px-3 py-1 text-xs font-medium text-red-700 transition-colors hover:bg-red-100"
                              >
                                연동 해제
                              </button>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  {/* 부모 검색 */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      부모 검색
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={parentSearchQuery}
                        onChange={e => setParentSearchQuery(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            handleSearchParents();
                          }
                        }}
                        placeholder="부모 이름 또는 이메일로 검색..."
                        className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#084773] focus:outline-none focus:ring-1 focus:ring-[#084773]"
                      />
                      <button
                        type="button"
                        onClick={handleSearchParents}
                        className="rounded-lg border border-[#084773] bg-[#084773] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#063a5a] flex items-center gap-1"
                      >
                        <Search className="h-4 w-4" />
                        검색
                      </button>
                    </div>
                  </div>

                  {/* 검색 가능한 부모 목록 (검색 버튼을 눌렀을 때만 표시) */}
                  {hasSearched && (
                    <div className="mt-3">
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        검색 결과
                      </label>
                      <div className="h-48 overflow-y-auto rounded-lg border border-slate-200 bg-white">
                        {searchResults.length === 0 ? (
                          <div className="px-3 py-4 text-center text-sm text-slate-500">
                            {parentSearchQuery.trim()
                              ? '검색 결과가 없습니다.'
                              : '검색 결과가 없습니다.'}
                          </div>
                        ) : (
                          <div className="divide-y divide-slate-200">
                            {searchResults.map(parent => (
                              <div
                                key={parent.id}
                                className="flex items-center justify-between px-3 py-2 hover:bg-slate-50"
                              >
                                <div className="flex-1">
                                  <div className="text-sm font-medium text-slate-900">
                                    {parent.name}
                                  </div>
                                  <div className="text-xs text-slate-500">
                                    {parent.email} | {parent.phone}
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={async () => {
                                    // 학부모 목록 조회 API 호출
                                    try {
                                      await getParents(1, 10);
                                    } catch (error) {
                                      console.error(
                                        '학부모 목록 조회 에러:',
                                        error
                                      );
                                    }

                                    setStudentParentLinks(prev => ({
                                      ...prev,
                                      [editingStudent.id]: parent.id,
                                    }));
                                    setSearchResults([]);
                                    setHasSearched(false);
                                    setParentSearchQuery('');
                                  }}
                                  className="ml-2 rounded-lg border border-[#084773] bg-[#084773] px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-[#063a5a]"
                                >
                                  연동
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 연동 학생 섹션 (학부모만) */}
              {editingParent && (
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                  <h3 className="mb-4 text-base font-semibold text-blue-900">
                    연동 학생
                  </h3>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      연동 학생
                    </label>
                    <input
                      type="text"
                      value={editParentForm.linkedStudent || ''}
                      readOnly
                      className="w-full rounded-lg border border-slate-300 bg-slate-100 px-3 py-2 text-sm text-slate-600 cursor-not-allowed"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 하단 버튼 (고정) */}
            <div className="flex-shrink-0 flex items-center justify-between gap-2 px-6 py-4 border-t border-slate-200 bg-white">
              <button
                type="button"
                onClick={handleResetPassword}
                className="rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100"
              >
                비밀번호 초기화
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditModalOpen(false);
                    setEditingStudent(null);
                    setEditingParent(null);
                  }}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  className="rounded-lg bg-[#084773] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#063a5a]"
                >
                  저장
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 삭제 확인 모달 */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div
            className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="mb-4 text-xl font-semibold text-slate-900">
              삭제 확인
            </h2>
            <p className="mb-6 text-sm text-slate-600">
              정말 이{' '}
              {deletingStudent ? '학생' : deletingParent ? '학부모' : ''}을
              삭제하시겠습니까?
            </p>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setDeleteModalOpen(false);
                  setDeletingStudent(null);
                  setDeletingParent(null);
                }}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
              >
                취소하기
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
              >
                삭제하기
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}

export default AdminPage;
