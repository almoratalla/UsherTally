import { useRouter } from "next/navigation";
import { useFirebaseAuth } from "../hooks/useFirebaseAuth";
import { useEffect } from "react";

const withAuth = (WrappedComponent: React.FC) => {
  const AuthenticatedComponent: React.FC = (props) => {
    const user = useFirebaseAuth();
    const router = useRouter();

    useEffect(() => {
      if (user === null) {
        // If the user is not authenticated, redirect to the sign-in page
        router.push("/signin");
      }
    }, [user, router]);

    // If user is authenticated, render the wrapped component
    if (user !== null) {
      return <WrappedComponent {...props} />;
    }

    // Optionally render a loading state while checking authentication
    return <div>Loading...</div>;
  };

  return AuthenticatedComponent;
};

export default withAuth;
