import { useEffect,useState } from "react";
import { useFetchUserData } from "src/hooks";


const UserProfile = () => {
  const [Username, setUsername] = useState("");
  useEffect(() => {
    const username = localStorage.getItem("username") || "";
    console.log("Username:", username);
    setUsername(username);
  }, []);
  const { userData, loading } = useFetchUserData(Username);
  if (loading) return <p>Loading...</p>;
  if (!userData) return <p>User not found</p>;
  return (
    <div>
      {userData ? (
        <div>
          <h1>{userData.firstName} {userData.lastName}</h1>
          <p>Username: @{userData.username}</p>

          <h2>Completed Challenges</h2>
          <div className="completed-challenges">
            {userData.completedChallenges?.length > 0 ? (
              userData.completedChallenges.map((badge, index) => (
                <div key={index} className="challenge-badge">
                  <p>Challenge: {badge.name}</p>
                  <p>Type: {badge.type === "daily" ? "Daily Challenge" : "Weekly Challenge"}</p>
                  <p>Goal Achieved: {badge.goalAchieved}</p>
                  <p>Date Completed: {new Date(badge.dateCompleted).toLocaleDateString()}</p>
                </div>
              ))
            ) : (
              <p>No challenges completed yet.</p>
            )}
          </div>
        </div>
      ) : (
        <p>User not found</p>
      )}
    </div>
  );
};

export default UserProfile;
