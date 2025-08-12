import { useState, useEffect } from 'react';
import { Search, Train, Clock, IndianRupee, MapPin, ArrowRight, Loader2 } from 'lucide-react';
import { trainService } from './services/trainService';
import type { Station,  RouteResult } from './types/train';

function App() {
  const [stations, setStations] = useState<Station[]>([]);
  const [sourceStation, setSourceStation] = useState<string>('');
  const [destinationStation, setDestinationStation] = useState<string>('');
  const [routes, setRoutes] = useState<RouteResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState<'price' | 'time'>('price');

  useEffect(() => {
    // Initialize with test data
    trainService.generateTestData();
    setStations(trainService.getStations());
  }, []);

  const handleSearch = async () => {
    if (!sourceStation || !destinationStation) {
      alert('Please select both source and destination stations');
      return;
    }

    if (sourceStation === destinationStation) {
      alert('Source and destination cannot be the same');
      return;
    }

    setLoading(true);
    try {
      const results = await trainService.findRoutes(sourceStation, destinationStation);
      setRoutes(results);
    } catch (error) {
      console.error('Error searching routes:', error);
    } finally {
      setLoading(false);
    }
  };

  const sortedRoutes = [...routes].sort((a, b) => {
    if (sortBy === 'price') {
      return a.totalPrice - b.totalPrice;
    } else {
      return a.segments[0].departureTime.localeCompare(b.segments[0].departureTime);
    }
  });

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const calculateDuration = (departure: string, arrival: string) => {
    const [depHour, depMin] = departure.split(':').map(Number);
    const [arrHour, arrMin] = arrival.split(':').map(Number);
    
    let depMinutes = depHour * 60 + depMin;
    let arrMinutes = arrHour * 60 + arrMin;
    
    if (arrMinutes < depMinutes) {
      arrMinutes += 24 * 60; // Next day
    }
    
    const diff = arrMinutes - depMinutes;
    const hours = Math.floor(diff / 60);
    const minutes = diff % 60;
    
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Train className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">RailSearch</h1>
            </div>
            <div className="hidden sm:block text-sm text-gray-500">
              Find the best train routes across India
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Form */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 items-end">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
                <MapPin className="inline w-4 h-4 mr-2" />
                From
              </label>
              <select
                value={sourceStation}
                onChange={(e) => setSourceStation(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
              >
                <option value="">Select departure station</option>
                {stations.map((station) => (
                  <option key={station.code} value={station.code}>
                    {station.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
                <MapPin className="inline w-4 h-4 mr-2" />
                To
              </label>
              <select
                value={destinationStation}
                onChange={(e) => setDestinationStation(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
              >
                <option value="">Select destination station</option>
                {stations.map((station) => (
                  <option key={station.code} value={station.code}>
                    {station.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2 lg:col-span-1">
              <button
              onClick={handleSearch}
              disabled={loading}
                className="w-full px-6 sm:px-8 py-2 sm:py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 font-semibold flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl text-sm sm:text-base"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  <span>Search Trains</span>
                </>
              )}
            </button>
            </div>
          </div>
        </div>

        {/* Sort Options */}
        {routes.length > 0 && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 space-y-3 sm:space-y-0">
            <div className="text-base sm:text-lg font-semibold text-gray-800">
              {routes.length} route{routes.length !== 1 ? 's' : ''} found
            </div>
            <div className="flex items-center space-x-3 sm:space-x-4">
              <span className="text-sm font-medium text-gray-600">Sort by:</span>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setSortBy('price')}
                  className={`px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm font-medium rounded-md transition-all duration-200 ${
                    sortBy === 'price'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Price
                </button>
                <button
                  onClick={() => setSortBy('time')}
                  className={`px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm font-medium rounded-md transition-all duration-200 ${
                    sortBy === 'time'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Time
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12 sm:py-16">
              <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Searching for the best routes...</p>
            </div>
          ) : routes.length === 0 && (sourceStation && destinationStation) ? (
            <div className="text-center py-12 sm:py-16 bg-white rounded-2xl shadow-sm">
              <Train className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">No routes found</h3>
              <p className="text-gray-600">
                No direct or connecting trains available for the selected route.
              </p>
            </div>
          ) : (
            sortedRoutes.map((route, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                <div className="p-4 sm:p-6">
                  {route.segments.map((segment, segmentIndex) => (
                    <div key={segmentIndex}>
                      {segmentIndex > 0 && (
                        <div className="flex items-center justify-center py-3 sm:py-4">
                          <div className="bg-orange-100 text-orange-600 px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-medium text-center">
                            <span className="hidden sm:inline">Connection at </span>
                            <span className="sm:hidden">Via </span>
                            {stations.find(s => s.code === segment.fromStation)?.name}
                          </div>
                        </div>
                      )}
                      
                      {/* Mobile Layout */}
                      <div className="block sm:hidden">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <Train className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-gray-900 text-sm truncate">{segment.trainName}</div>
                            <div className="text-xs text-gray-500">{segment.trainId}</div>
                          </div>
                          {segmentIndex === route.segments.length - 1 && (
                            <div className="text-right flex-shrink-0">
                              <div className="flex items-center text-lg font-bold text-green-600">
                                <IndianRupee className="w-4 h-4" />
                                {Math.round(route.totalPrice)}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="text-center">
                            <div className="text-lg font-bold text-gray-900">
                              {formatTime(segment.departureTime)}
                            </div>
                            <div className="text-xs text-gray-500 truncate">
                              {stations.find(s => s.code === segment.fromStation)?.name}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-gray-900">
                              {formatTime(segment.arrivalTime)}
                            </div>
                            <div className="text-xs text-gray-500 truncate">
                              {stations.find(s => s.code === segment.toStation)?.name}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-center mb-4">
                          <div className="flex flex-col items-center">
                            <div className="text-xs text-gray-500 mb-1">
                              {calculateDuration(segment.departureTime, segment.arrivalTime)}
                            </div>
                            <div className="flex items-center">
                              <div className="w-2 h-2 border-2 border-blue-600 rounded-full"></div>
                              <div className="w-16 h-0.5 bg-blue-200"></div>
                              <ArrowRight className="w-3 h-3 text-blue-600" />
                              <div className="w-16 h-0.5 bg-blue-200"></div>
                              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              {segment.distance} km
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Desktop Layout */}
                      <div className="hidden sm:flex items-center justify-between">
                        <div className="flex items-center space-x-4 lg:space-x-6">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-blue-100 rounded-full flex items-center justify-center">
                              <Train className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600" />
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900 text-sm lg:text-base">{segment.trainName}</div>
                              <div className="text-sm text-gray-500">{segment.trainId}</div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-4 lg:space-x-8">
                            <div className="text-center">
                              <div className="text-lg lg:text-2xl font-bold text-gray-900">
                                {formatTime(segment.departureTime)}
                              </div>
                              <div className="text-xs lg:text-sm text-gray-500">
                                {stations.find(s => s.code === segment.fromStation)?.name}
                              </div>
                            </div>

                            <div className="flex flex-col items-center">
                              <div className="text-xs lg:text-sm text-gray-500 mb-1">
                                {calculateDuration(segment.departureTime, segment.arrivalTime)}
                              </div>
                              <div className="flex items-center">
                                <div className="w-2 h-2 lg:w-3 lg:h-3 border-2 border-blue-600 rounded-full"></div>
                                <div className="w-12 lg:w-20 h-0.5 bg-blue-200"></div>
                                <ArrowRight className="w-4 h-4 text-blue-600" />
                                <div className="w-12 lg:w-20 h-0.5 bg-blue-200"></div>
                                <div className="w-2 h-2 lg:w-3 lg:h-3 bg-blue-600 rounded-full"></div>
                              </div>
                              <div className="text-xs text-gray-400 mt-1">
                                {segment.distance} km
                              </div>
                            </div>

                            <div className="text-center">
                              <div className="text-lg lg:text-2xl font-bold text-gray-900">
                                {formatTime(segment.arrivalTime)}
                              </div>
                              <div className="text-xs lg:text-sm text-gray-500">
                                {stations.find(s => s.code === segment.toStation)?.name}
                              </div>
                            </div>
                          </div>
                        </div>

                        {segmentIndex === route.segments.length - 1 && (
                          <div className="flex flex-col items-end">
                            <div className="flex items-center text-xl lg:text-2xl font-bold text-green-600 mb-1">
                              <IndianRupee className="w-5 h-5 lg:w-6 lg:h-6" />
                              {Math.round(route.totalPrice)}
                            </div>
                            <div className="text-xs lg:text-sm text-gray-500">
                              Total: {route.totalDistance} km
                            </div>
                          </div>
                        )}
                      </div>

                      {segmentIndex < route.segments.length - 1 && !window.matchMedia('(max-width: 640px)').matches && (
                        <hr className="my-4 border-gray-200" />
                      )}
                    </div>
                  ))}
                </div>

                <div className="bg-gray-50 px-4 sm:px-6 py-3 border-t border-gray-100">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-sm space-y-2 sm:space-y-0">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 text-gray-600">
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        <span className="hidden sm:inline">Journey: </span>
                        {calculateDuration(
                          route.segments[0].departureTime,
                          route.segments[route.segments.length - 1].arrivalTime
                        )}
                      </span>
                      <span className="text-xs sm:text-sm">
                        {route.segments.length === 1 ? 'Direct' : `${route.segments.length} trains`}
                      </span>
                    </div>
                    <button className="w-full sm:w-auto bg-blue-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium text-sm sm:text-base">
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default App;