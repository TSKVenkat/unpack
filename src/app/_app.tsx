import { useEffect } from "react";
import { useRouter } from "next/router";

function MyApp({ Component, pageProps }: any) {
  const router = useRouter();

  useEffect(() => {
    const handleRouteChange = (url: string) => {
      if (window.plausible) {
        window.plausible("pageview", { u: url });
      }
      // Add PostHog or Datadog tracking here if needed
    };
    router.events.on("routeChangeComplete", handleRouteChange);
    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router.events]);

  return <Component {...pageProps} />;
}

export default MyApp; 