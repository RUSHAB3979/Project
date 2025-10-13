'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import TutoringRequestForm from '@/components/TutoringRequestForm';

interface TutoringRequest {
  id: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  message: string;
  tutor_message?: string;
  duration: number;
  cost: number;
  created_at: string;
  student: {
    id: string;
    name: string;
    email: string;
    profile_img: string | null;
  };
  tutor: {
    id: string;
    name: string;
    email: string;
    profile_img: string | null;
  };
  skill: {
    id: string;
    name: string;
    category: string;
  };
}

export default function TutoringPage() {
  const [requests, setRequests] = useState<TutoringRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showRequestForm, setShowRequestForm] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');

      const res = await fetch('http://localhost:3001/api/tutoring/my-requests', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) throw new Error('Failed to fetch requests');

      const data = await res.json();
      setRequests(data);
    } catch (err) {
      setError('Failed to load tutoring requests');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestAction = async (requestId: string, action: 'ACCEPTED' | 'REJECTED', message?: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');

      const res = await fetch(`http://localhost:3001/api/tutoring/request/${requestId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: action, message })
      });

      if (!res.ok) throw new Error('Failed to update request');

      const updatedRequest = await res.json();
      setRequests(requests.map(req => 
        req.id === updatedRequest.id ? updatedRequest : req
      ));
    } catch (err) {
      setError('Failed to update request');
      console.error(err);
    }
  };

  const RequestCard = ({ request }: { request: TutoringRequest }) => {
    const [responseMessage, setResponseMessage] = useState('');
    const isReceived = request.tutor.id === localStorage.getItem('userId');

    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <img
              src={isReceived ? request.student.profile_img || '/default-avatar.png' : request.tutor.profile_img || '/default-avatar.png'}
              alt="Profile"
              className="w-12 h-12 rounded-full"
            />
            <div>
              <h3 className="font-semibold">
                {isReceived ? request.student.name : request.tutor.name}
              </h3>
              <p className="text-sm text-gray-600">
                {request.skill.name} - {request.duration} minutes
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className={`px-3 py-1 rounded-full text-sm ${
              request.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
              request.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
              'bg-red-100 text-red-800'
            }`}>
              {request.status}
            </span>
            <p className="text-sm text-gray-600 mt-1">{request.cost} SkillCoins</p>
          </div>
        </div>

        <p className="text-gray-700 mb-4">{request.message}</p>
        
        {request.tutor_message && (
          <div className="bg-gray-50 p-3 rounded mb-4">
            <p className="text-sm text-gray-700">{request.tutor_message}</p>
          </div>
        )}

        {isReceived && request.status === 'PENDING' && (
          <div className="space-y-3">
            <textarea
              value={responseMessage}
              onChange={(e) => setResponseMessage(e.target.value)}
              placeholder="Add a response message..."
              className="w-full p-2 border rounded"
              rows={2}
            />
            <div className="flex space-x-2">
              <button
                onClick={() => handleRequestAction(request.id, 'ACCEPTED', responseMessage)}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Accept
              </button>
              <button
                onClick={() => handleRequestAction(request.id, 'REJECTED', responseMessage)}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Decline
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Tutoring Requests</h1>
            <button
              onClick={() => setShowRequestForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              New Request
            </button>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : requests.length > 0 ? (
            <div className="space-y-4">
              {requests.map(request => (
                <RequestCard key={request.id} request={request} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No tutoring requests yet</p>
            </div>
          )}
        </div>
      </div>

      {showRequestForm && (
        <TutoringRequestForm
          onClose={() => setShowRequestForm(false)}
          onSuccess={() => {
            setShowRequestForm(false);
            fetchRequests();
          }}
        />
      )}
    </div>
  );
}