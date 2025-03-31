import "../styles/globals.css";
import "@repo/ui/styles.css";

export const metadata = {
  title: "Footy Mastermind",
  description: "A football trivia game",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="">
      <body className="bg-background-default text-foreground">{children}</body>
    </html>
  );
}
