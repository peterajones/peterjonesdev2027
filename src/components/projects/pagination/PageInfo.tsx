interface Props {
  currentPage: number;
  totalPages: number;
}

export default function PageInfo({ currentPage, totalPages }: Props) {
  return (
    <div className="page-info">
      <p>
        Page {currentPage} of {Math.ceil(totalPages)}
      </p>
    </div>
  );
}
