import { useEffect,useState } from "react";




interface ChallengeBadge {
  name: string;
  type: "daily" | "weekly";
  dateCompleted: string;
  goalAchieved: string;
}

interface UserData {
  firstName: string;
  lastName: string;
  username: string;
  completedChallenges: ChallengeBadge[];
}

const useFetchUserData = (username: string) => {
  const [userData, setUserData] = useState<UserData | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  useEffect(() => {
    if (!username) {
      setLoading(false);
      return;
    }
    const fetchUserData = async () => {
      try {
        const apiUrl = process.env.REACT_APP_API_URL;
        const response = await fetch(`${apiUrl}/api/user/${username}`);
        const data = await response.json();

        if (response.ok) {
          setUserData(data);
        } else {
          console.error("Error fetching user data:", data.message);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [username]);

  return { userData, loading };
};

export default useFetchUserData;