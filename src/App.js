import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, onSnapshot, doc, updateDoc, getDocs } from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged, signOut, signInWithCustomToken } from 'firebase/auth';

const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};


// --- App Initialization ---
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Use a global variable for the app's unique ID for Firestore paths, with a fallback.
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// --- Logo Component ---
const CivicSyncLogo = ({ className }) => (
    <svg className={className} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#3b82f6' }} />
                <stop offset="100%" style={{ stopColor: '#6366f1' }} />
            </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="45" fill="url(#logoGradient)" />
        <path d="M50,10 C27.94,10 10,27.94 10,50 C10,72.06 27.94,90 50,90 C72.06,90 90,72.06 90,50 C90,27.94 72.06,10 50,10 Z M50,80 C33.46,80 20,66.54 20,50 C20,33.46 33.46,20 50,20 C66.54,20 80,33.46 80,50 C80,66.54 66.54,80 50,80 Z" fill="#1e3a8a" />
        <path d="M50 32C41.16 32 34 39.16 34 48L34 52C34 60.84 41.16 68 50 68C58.84 68 66 60.84 66 52L66 48C66 39.16 58.84 32 50 32ZM50 62C44.48 62 40 57.52 40 52L40 48C40 42.48 44.48 38 50 38C55.52 38 60 42.48 60 48L60 52C60 57.52 55.52 62 50 62Z" fill="white" />
        <path d="M42,50 a8,8 0 0,1 16,0" stroke="white" strokeWidth="4" fill="none" strokeLinecap="round" />
    </svg>
);


// --- Admin Login Component ---
const AdminLogin = ({ onLogin, error, isLoading }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onLogin(email, password);
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 p-4">
            <div className="w-full max-w-sm">
                <div className="text-center mb-6">
                    <CivicSyncLogo className="w-20 h-20 mx-auto mb-4" />
                    <h1 className="text-4xl font-bold text-gray-800">CivicSync</h1>
                    <p className="text-gray-600 mt-1">Authority Dashboard</p>
                </div>
                <div className="bg-white p-8 rounded-xl shadow-md">
                    <h2 className="text-xl font-semibold text-center mb-6">Administrator Login</h2>
                    {error && <p className="bg-red-100 text-red-700 p-3 rounded-lg text-center mb-4 text-sm">{error}</p>}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-gray-700">Email</label>
                            <input
                                type="email"
                                placeholder="admin@civicsync.gov"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" required
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700">Password</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" required
                            />
                        </div>
                        <button type="submit" disabled={isLoading} className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400">
                            {isLoading ? 'Signing In...' : 'Sign In'}
                        </button>
                    </form>
                </div>
                 <p className="text-center text-xs text-gray-500 mt-4">For prototype: use <strong>admin@civicsync.gov</strong> & <strong>admin123</strong></p>
            </div>
        </div>
    );
};

// --- Header Component ---
const Header = ({ adminEmail, onLogout }) => (
    <header className="bg-white shadow-sm sticky top-0 z-20">
        <div className="container mx-auto px-4 md:px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <CivicSyncLogo className="w-8 h-8" />
                <h1 className="text-xl font-bold text-gray-800">CivicSync Authority Portal</h1>
            </div>
            <div className="flex items-center gap-4">
                 <span className="text-sm text-gray-600 hidden md:block">{adminEmail}</span>
                 <button onClick={onLogout} className="text-sm text-blue-600 hover:underline font-semibold">Logout</button>
            </div>
        </div>
    </header>
);

// --- Filters Component ---
const Filters = ({ setSortBy, setFilterStatus, setFilterMedia, setSearchLocation, issueCount }) => (
    <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            <div className="lg:col-span-1">
                <label className="text-xs font-semibold text-gray-600">Sort By</label>
                <select onChange={(e) => setSortBy(e.target.value)} className="w-full p-2 mt-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm">
                    <option value="priority">Priority Score</option>
                    <option value="upvotes">Most Upvotes</option>
                    <option value="user_coins">User Coins</option>
                    <option value="date_newest">Newest First</option>
                    <option value="date_oldest">Oldest First</option>
                </select>
            </div>
             <div className="lg:col-span-1">
                <label className="text-xs font-semibold text-gray-600">Status</label>
                <select onChange={(e) => setFilterStatus(e.target.value)} className="w-full p-2 mt-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm">
                    <option>All</option>
                    <option>Acknowledged</option>
                    <option>In-Progress</option>
                    <option>Resolved</option>
                </select>
            </div>
             <div className="lg:col-span-2">
                <label className="text-xs font-semibold text-gray-600">Location Search</label>
                <input
                    type="text"
                    placeholder="e.g., Main Street, City Park..."
                    onChange={(e) => setSearchLocation(e.target.value)}
                    className="w-full p-2 mt-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
                />
            </div>
            <div className="flex items-center justify-between h-full pt-4">
                 <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input type="checkbox" onChange={(e) => setFilterMedia(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    Has Media
                </label>
                 <span className="text-sm font-bold text-gray-600 bg-slate-100 px-3 py-1 rounded-full">{issueCount} Results</span>
            </div>
        </div>
    </div>
);

// --- Issue Table Row Component ---
const IssueRow = ({ issue, onStatusChange, reporterProfile }) => {
    const getStatusInfo = (status) => {
        switch (status) {
            case 'Acknowledged': return { selectClass: 'bg-blue-100 text-blue-800 border-blue-200' };
            case 'In-Progress': return { selectClass: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
            case 'Resolved': return { selectClass: 'bg-green-100 text-green-800 border-green-200' };
            default: return { selectClass: 'bg-gray-100 text-gray-800 border-gray-200' };
        }
    };
    const statusInfo = getStatusInfo(issue.status);
    const mediaUrl = issue.imageUrl || issue.videoUrl || issue.audioUrl;

    return (
        <tr className="bg-white border-b hover:bg-slate-50">
            <td className="px-6 py-4">
                <div className="font-bold text-gray-900">{issue.title}</div>
                <div className="text-xs text-gray-500">{issue.location}</div>
                {mediaUrl && <a href={mediaUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline mt-1 inline-block">View Media</a>}
            </td>
            <td className="px-6 py-4">
                <div className="font-medium text-gray-800">{reporterProfile?.name || 'Guest User'}</div>
                <div className="text-xs text-amber-600 font-semibold">{reporterProfile?.points || 0} Coins</div>
            </td>
            <td className="px-6 py-4 text-center font-bold text-lg text-indigo-600">{issue.upvotes || 0}</td>
            <td className="px-6 py-4 text-xs text-gray-500">{issue.createdAt?.seconds ? new Date(issue.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}</td>
            <td className="px-6 py-4">
                <select
                    value={issue.status}
                    onChange={(e) => onStatusChange(issue.id, e.target.value)}
                    className={`w-full p-1.5 text-xs font-semibold border rounded-md focus:ring-2 focus:ring-blue-500 ${statusInfo.selectClass}`}
                >
                    <option>Acknowledged</option>
                    <option>In-Progress</option>
                    <option>Resolved</option>
                </select>
            </td>
        </tr>
    );
};

// --- Issue Table Component ---
const IssueTable = ({ issues, onStatusChange, userProfiles }) => (
    <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-700">
            <thead className="text-xs text-gray-800 uppercase bg-slate-50">
                <tr>
                    <th scope="col" className="px-6 py-3">Issue / Location</th>
                    <th scope="col" className="px-6 py-3">Reporter / Coins</th>
                    <th scope="col" className="px-6 py-3 text-center">Upvotes</th>
                    <th scope="col" className="px-6 py-3">Reported On</th>
                    <th scope="col" className="px-6 py-3">Status</th>
                </tr>
            </thead>
            <tbody>
                {issues.length === 0 ? (
                    <tr><td colSpan="5" className="text-center py-10 text-gray-500">No matching issues found.</td></tr>
                ) : (
                    issues.map(issue => <IssueRow key={issue.id} issue={issue} onStatusChange={onStatusChange} reporterProfile={userProfiles[issue.reporterId]} />)
                )}
            </tbody>
        </table>
    </div>
);


// --- Main Admin Dashboard Component ---
const AdminDashboard = () => {
    const [adminUser, setAdminUser] = useState(null);
    const [loginError, setLoginError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [issues, setIssues] = useState([]);
    const [userProfiles, setUserProfiles] = useState({});

    const [sortBy, setSortBy] = useState('priority');
    const [filterStatus, setFilterStatus] = useState('All');
    const [filterMedia, setFilterMedia] = useState(false);
    const [searchLocation, setSearchLocation] = useState('');

    const issuesCollectionPath = `artifacts/${appId}/public/data/issues`;
    const profilesCollectionPath = `artifacts/${appId}/public/data/profiles`;

    // Effect to manage all authentication logic
    useEffect(() => {
        // Set up the listener that will react to all auth changes
        const unsubscribe = onAuthStateChanged(auth, user => {
            if (user) {
                // For this prototype, we assume any signed-in user is the admin.
                setAdminUser({ email: 'admin@civicsync.gov', uid: user.uid });
            } else {
                setAdminUser(null);
            }
            setIsLoading(false);
            setIsLoggingIn(false);
        });

        // Attempt initial sign-in with the custom token provided by the environment
        const performInitialSignIn = async () => {
            try {
                // Only try to sign in if there's no active user and a token is available.
                if (!auth.currentUser && typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
                    await signInWithCustomToken(auth, __initial_auth_token);
                } else {
                    // If there's already a user or no token, the listener above handles the state.
                    // We just need to ensure the loading indicator is turned off.
                    setIsLoading(false);
                }
            } catch (error) {
                console.error("Custom token sign-in failed:", error);
                setLoginError("Session token is invalid or expired. Please login manually.");
                setIsLoading(false); // Stop loading on error to show login form
            }
        };

        performInitialSignIn();

        // Return the cleanup function for the auth state listener
        return () => unsubscribe();
    }, []); // This effect runs only once on component mount.

    // Effect for fetching data from Firestore (only when admin is logged in)
    useEffect(() => {
        if (!adminUser) {
            setIssues([]);
            setUserProfiles({});
            return;
        }

        const fetchProfiles = async () => {
            try {
                const profileCollectionRef = collection(db, profilesCollectionPath);
                const profileSnapshot = await getDocs(profileCollectionRef);
                const profilesData = {};
                profileSnapshot.forEach(doc => {
                    profilesData[doc.id] = doc.data();
                });
                setUserProfiles(profilesData);
            } catch (error) {
                 console.error("Error fetching profiles:", error);
            }
        };

        fetchProfiles();

        const issuesCollectionRef = collection(db, issuesCollectionPath);
        const unsubscribeIssues = onSnapshot(issuesCollectionRef, (snapshot) => {
            const issuesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setIssues(issuesData);
        }, (error) => {
            console.error("Error fetching issues:", error);
        });

        return () => unsubscribeIssues();
    }, [adminUser, profilesCollectionPath, issuesCollectionPath]); // Added collection paths to dependencies


    // --- Filtering and Prioritization Logic ---
    const filteredAndSortedIssues = useMemo(() => {
        let processedIssues = [...issues];

        if (filterStatus !== 'All') {
            processedIssues = processedIssues.filter(issue => issue.status === filterStatus);
        }
        if (filterMedia) {
            processedIssues = processedIssues.filter(issue => issue.imageUrl || issue.videoUrl || issue.audioUrl);
        }
        if (searchLocation) {
            processedIssues = processedIssues.filter(issue => 
                issue.location && issue.location.toLowerCase().includes(searchLocation.toLowerCase())
            );
        }

        processedIssues.sort((a, b) => {
            switch (sortBy) {
                case 'priority':
                    const priorityA = (a.upvotes || 0) + (userProfiles[a.reporterId]?.points || 0) / 10;
                    const priorityB = (b.upvotes || 0) + (userProfiles[b.reporterId]?.points || 0) / 10;
                    return priorityB - priorityA;
                case 'upvotes':
                    return (b.upvotes || 0) - (a.upvotes || 0);
                case 'user_coins':
                     return (userProfiles[b.reporterId]?.points || 0) - (userProfiles[a.reporterId]?.points || 0);
                case 'date_newest':
                    return (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0);
                case 'date_oldest':
                    return (a.createdAt?.toMillis() || 0) - (b.createdAt?.toMillis() || 0);
                default:
                    return 0;
            }
        });

        return processedIssues;
    }, [issues, sortBy, filterStatus, filterMedia, searchLocation, userProfiles]);

    // --- Status Update Handler ---
    const handleStatusChange = async (issueId, newStatus) => {
        const issueRef = doc(db, issuesCollectionPath, issueId);
        try {
            await updateDoc(issueRef, { status: newStatus });
        } catch (err) {
            console.error("Error updating status:", err);
            // CORRECTION: Replaced browser alert with console error for better debugging and user experience.
            // In a real app, you might show a small toast notification here.
        }
    };

    // --- Login Handler ---
    const handleLogin = async (email, password) => {
        setIsLoggingIn(true);
        setLoginError(null);
        // Prototype check: In a real app, this would be a call to signInWithEmailAndPassword.
        if (email.toLowerCase() === 'admin@civicsync.gov' && password === 'admin123') {
            try {
                // Signing in anonymously to get access based on Firestore rules.
                // NOTE: This may still cause permission errors if rules require more than just auth.
                await signInAnonymously(auth);
            } catch (error) {
                console.error("Admin sign-in failed:", error);
                setLoginError("Firebase authentication failed. Check console.");
                setIsLoggingIn(false);
            }
        } else {
            setLoginError('Invalid credentials. Please try again.');
            setIsLoggingIn(false);
        }
    };

    // --- Logout Handler ---
    const handleLogout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Sign out failed:", error);
        }
    };

    if (isLoading) {
         return <div className="flex items-center justify-center min-h-screen bg-slate-100"><div className="text-lg font-semibold">Loading Dashboard...</div></div>;
    }

    if (!adminUser) {
        return <AdminLogin onLogin={handleLogin} error={loginError} isLoading={isLoggingIn} />;
    }

    return (
        <div className="bg-slate-100 min-h-screen font-sans">
            <Header adminEmail={adminUser.email} onLogout={handleLogout} />
            <main className="container mx-auto p-4 md:p-6">
                <Filters
                    setSortBy={setSortBy}
                    setFilterStatus={setFilterStatus}
                    setFilterMedia={setFilterMedia}
                    setSearchLocation={setSearchLocation}
                    issueCount={filteredAndSortedIssues.length}
                />
                <IssueTable issues={filteredAndSortedIssues} onStatusChange={handleStatusChange} userProfiles={userProfiles}/>
            </main>
        </div>
    );
};

export default AdminDashboard;

