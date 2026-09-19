import { useEffect, useState } from 'react';
import Users from './Users';
import Pages from './Pages';
import PageInfo from './PageInfo';
import styles from './Pagination.module.css';

const API = 'https://jsonplaceholder.typicode.com/users';

export default function Data() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(2);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await fetch(API);
        const data = await res.json();
        setUsers(data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
      setLoading(false);
    };
    fetchUsers();
  }, []);

  // Get current users
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);

  // Change page
  const getPage = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    setIsActive(true);
  };

  return (
    <div className={styles.paginationContainer}>
      <Pages
        usersPerPage={usersPerPage}
        totalUsers={users.length}
        getPage={getPage}
        isActive={isActive}
        currentPage={currentPage}
      />
      <PageInfo currentPage={currentPage} totalPages={users.length / usersPerPage} />
      <Users users={currentUsers} loading={loading} />
    </div>
  );
}
