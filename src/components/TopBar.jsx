export default function TopBar({ title }) {
  return (
    <header className="top">
      <h2>{title}</h2>
      <div className="profile">
        <span>Ian Florida</span>
        <div className="avatar">IF</div>
      </div>
    </header>
  );
}
