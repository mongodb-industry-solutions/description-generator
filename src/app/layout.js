import NavigationBar from "@/components/navbar/NavigationBar";
import { GeistSans } from "geist/font/sans";
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import ClientProvider from "./ClientProvider";

export const metadata = {
  title: 'Retail Description Generator',
  description: "",
};

export default function RootLayout({ children }) {

  return (
    <html lang="en" className={GeistSans.className}>
      <body>
        <ClientProvider>
          <NavigationBar/>
          {children}
        </ClientProvider>
      </body>
    </html>
  );
}
