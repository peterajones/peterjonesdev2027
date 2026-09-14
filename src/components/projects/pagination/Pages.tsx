interface Props {
  usersPerPage: number;
  totalUsers: number;
  getPage: (pageNumber: number) => void;
  isActive: boolean;
  currentPage: number;
}

export default function Pages({ usersPerPage, totalUsers, getPage, isActive, currentPage }: Props) {
  const pageNumbers: number[] = [];

  for (let i = 1; i <= Math.ceil(totalUsers / usersPerPage); i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="page-numbers">
      <ul className="page-nums">
        {pageNumbers.map((pageNumber) => (
          <li
            key={pageNumber}
            id={'page' + pageNumber}
            onClick={() => getPage(pageNumber)}
            className={currentPage === pageNumber && isActive ? 'page-num active' : 'page-num'}
          >
            <span>{pageNumber}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
