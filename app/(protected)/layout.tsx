import { Navbar } from "./_components/navbar";

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

const ProtectedLayout = ({ children }: ProtectedLayoutProps) => {
  return (
    <div
      className="h-fit w-full flex flex-col gap-y-3 items-center justify-center  min-h-screen
     bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-400 to-blue-800"
    >
      <Navbar />
      {children}
    </div>
  );
};

export default ProtectedLayout;
