import styles from './Pagination.module.css';

interface Props {
  currentPage: number;
  totalPages: number;
}

export default function PageInfo({ currentPage, totalPages }: Props) {
  return (
    <div className={styles.pageInfo}>
      <p>
        Page {currentPage} of {Math.ceil(totalPages)}
      </p>
    </div>
  );
}
