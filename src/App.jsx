import { useState, useEffect } from 'react';
import { Search, MapPin, Sun, Moon, Cloud, Droplets, Wind, Thermometer, AlertCircle, Menu, X } from 'lucide-react';

const App = () => {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('weather-darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return true;
  });

  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recentCities, setRecentCities] = useState(() => {
    const saved = localStorage.getItem('weather-recent-cities');
    return saved ? JSON.parse(saved) : ['London', 'New York', 'Tokyo', 'Paris', 'Dubai'];
  });

  useEffect(() => {
    localStorage.setItem('weather-darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('weather-recent-cities', JSON.stringify(recentCities));
  }, [recentCities]);

  // Handle window resize - auto close sidebar on mobile, open on desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchWeather('London');
  }, []);

  const fetchWeather = async (searchCity) => {
    if (!searchCity.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const API_KEY = 'JTBQGH285HCA59A2RZNQGDCT7';
      const response = await fetch(
        `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${encodeURIComponent(searchCity)}?unitGroup=metric&key=${API_KEY}&contentType=json`
      );

      if (!response.ok) throw new Error('City not found');

      const data = await response.json();

      setWeather({
        location: data.resolvedAddress,
        temp: Math.round(data.currentConditions.temp),
        feelsLike: Math.round(data.currentConditions.feelslike),
        conditions: data.currentConditions.conditions,
        humidity: data.currentConditions.humidity,
        windspeed: Math.round(data.currentConditions.windspeed),
        icon: data.currentConditions.icon,
        days: data.days.slice(1, 6).map(day => ({
          day: new Date(day.datetime).toLocaleDateString('en-US', { weekday: 'short' }),
          temp: Math.round(day.temp),
          icon: day.icon,
          conditions: day.conditions
        }))
      });

      if (!recentCities.includes(searchCity)) {
        setRecentCities([searchCity, ...recentCities.slice(0, 4)]);
      }
    } catch (err) {
      setError(err.message);
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (city.trim()) {
      fetchWeather(city.trim());
      setCity('');
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      }
    }
  };

  const getWeatherIcon = (icon) => {
    const icons = {
      'clear-day': '☀️', 'clear-night': '🌙', 'cloudy': '☁️',
      'rain': '🌧️', 'snow': '❄️', 'thunder': '⛈️', 'wind': '💨',
      'fog': '🌫️', 'partly-cloudy-day': '⛅', 'partly-cloudy-night': '🌤️'
    };
    return icons[icon] || '🌡️';
  };

  return (
    <div className={`min-h-screen transition-all duration-500 ${darkMode
        ? 'dark bg-gradient-to-br from-gray-900 via-blue-950 to-slate-950'
        : 'bg-gradient-to-br from-sky-50 via-blue-50 to-cyan-50'
      }`}>

      {/* Top Bar */}
      <div className={`fixed top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-3 shadow-md ${darkMode ? 'bg-gray-800/90 backdrop-blur-sm' : 'bg-white/90 backdrop-blur-sm'
        }`}>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-700 text-white' : 'hover:bg-gray-100 text-gray-800'
            }`}
        >
          <Menu className="w-5 h-5" />
        </button>

        <h1 className={`text-base sm:text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          🌤️ Weather App
        </h1>

        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-700 text-sky-400' : 'hover:bg-gray-100 text-gray-800'
            }`}
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Overlay - only on mobile when sidebar is open */}
      {sidebarOpen && typeof window !== 'undefined' && window.innerWidth < 1024 && (
        <div className="fixed inset-0 bg-black/50 z-30" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div className={`
  fixed top-0 left-0 bottom-0 z-40 w-72 flex flex-col p-4 shadow-xl transition-transform duration-300
  ${darkMode ? 'bg-gray-800' : 'bg-white'}
  ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
`}>
        <div className="flex items-center justify-between mb-6 pb-4 border-b dark:border-gray-700 pt-12 lg:pt-0">
          <div className="flex items-center gap-2">
            <MapPin className={`w-6 h-6 ${darkMode ? 'text-sky-400' : 'text-sky-600'}`} />
            <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Recent Cities</h2>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="p-1">
            <X className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
          </button>
        </div>

        <div className="flex-1 space-y-2 overflow-y-auto">
          {recentCities.map((recentCity, idx) => (
            <button
              key={idx}
              onClick={() => {
                fetchWeather(recentCity);
                setSidebarOpen(false);
              }}
              className={`w-full text-left p-3 rounded-lg transition-all duration-300 flex items-center gap-3 ${darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'
                }`}
            >
              <MapPin className={`w-4 h-4 ${darkMode ? 'text-sky-400' : 'text-sky-600'}`} />
              <span className="font-semibold">{recentCity}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className={`pt-16 transition-all duration-300 ${sidebarOpen ? 'lg:ml-72' : 'lg:ml-0'}`}>
        <div className="container mx-auto px-4 py-4 sm:py-6 max-w-6xl">

          {/* Search Section */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search city..."
                className={`flex-1 px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 transition-all ${darkMode
                    ? 'bg-gray-800/50 border-gray-700 text-white focus:border-sky-500 focus:ring-sky-500/20 placeholder-gray-500'
                    : 'bg-white/50 border-gray-200 text-gray-900 focus:border-sky-400 focus:ring-sky-400/20 placeholder-gray-400'
                  }`}
              />
              <button
                onClick={handleSearch}
                disabled={loading || !city.trim()}
                className="px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Search className="w-5 h-5" />
                Search
              </button>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-sky-500 border-t-transparent mx-auto mb-4"></div>
              <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Fetching weather data...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className={`rounded-xl p-6 text-center max-w-md mx-auto ${darkMode ? 'bg-red-900/20 border border-red-800' : 'bg-red-50 border border-red-200'}`}>
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
              <p className={`text-lg font-semibold mb-2 ${darkMode ? 'text-red-400' : 'text-red-600'}`}>{error}</p>
              <button onClick={() => fetchWeather('London')} className="mt-3 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors">
                Try Again with London
              </button>
            </div>
          )}

          {/* Weather Display */}
          {weather && !loading && !error && (
            <div className="animate-fade-in">

              {/* ===== DESKTOP LAYOUT (lg screens) ===== */}
              <div className="hidden lg:block">
                {/* Location Header */}
                <div className="text-center mb-8">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <MapPin className={`w-5 h-5 ${darkMode ? 'text-sky-400' : 'text-sky-600'}`} />
                    <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{weather.location}</h2>
                  </div>
                  <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{weather.conditions}</p>
                </div>

                {/* Main Weather Display */}
                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div className={`rounded-2xl p-8 text-center ${darkMode ? 'bg-gray-800/50 backdrop-blur-sm' : 'bg-white/50 backdrop-blur-sm'}`}>
                    <div className={`text-7xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>{weather.temp}°C</div>
                    <p className={`text-md ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Feels like {weather.feelsLike}°C</p>
                  </div>
                  <div className={`rounded-2xl p-8 text-center ${darkMode ? 'bg-gray-800/50 backdrop-blur-sm' : 'bg-white/50 backdrop-blur-sm'}`}>
                    <div className="text-8xl mb-2">{getWeatherIcon(weather.icon)}</div>
                  </div>
                </div>

                {/* Weather Details Cards */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className={`p-4 rounded-xl flex items-center gap-3 transition-all duration-300 hover:scale-105 ${darkMode ? 'bg-gray-800/50 backdrop-blur-sm' : 'bg-white/50 backdrop-blur-sm'
                    }`}>
                    <div className="p-2 rounded-lg bg-sky-500/20">
                      <Thermometer className={`w-6 h-6 ${darkMode ? 'text-sky-400' : 'text-sky-600'}`} />
                    </div>
                    <div>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Feels Like</p>
                      <p className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{weather.feelsLike}°C</p>
                    </div>
                  </div>

                  <div className={`p-4 rounded-xl flex items-center gap-3 transition-all duration-300 hover:scale-105 ${darkMode ? 'bg-gray-800/50 backdrop-blur-sm' : 'bg-white/50 backdrop-blur-sm'
                    }`}>
                    <div className="p-2 rounded-lg bg-sky-500/20">
                      <Droplets className={`w-6 h-6 ${darkMode ? 'text-sky-400' : 'text-sky-600'}`} />
                    </div>
                    <div>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Humidity</p>
                      <p className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{weather.humidity}%</p>
                    </div>
                  </div>

                  <div className={`p-4 rounded-xl flex items-center gap-3 transition-all duration-300 hover:scale-105 ${darkMode ? 'bg-gray-800/50 backdrop-blur-sm' : 'bg-white/50 backdrop-blur-sm'
                    }`}>
                    <div className="p-2 rounded-lg bg-sky-500/20">
                      <Wind className={`w-6 h-6 ${darkMode ? 'text-sky-400' : 'text-sky-600'}`} />
                    </div>
                    <div>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Wind Speed</p>
                      <p className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{weather.windspeed} km/h</p>
                    </div>
                  </div>
                </div>

                {/* 5-Day Forecast */}
                <div className={`rounded-2xl p-6 ${darkMode ? 'bg-gray-800/50 backdrop-blur-sm' : 'bg-white/50 backdrop-blur-sm'}`}>
                  <h3 className={`text-xl font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    <Cloud className="w-5 h-5" /> 5-Day Forecast
                  </h3>
                  <div className="grid grid-cols-5 gap-4">
                    {weather.days.map((day, idx) => (
                      <div key={idx} className="text-center p-3 rounded-xl transition-all hover:scale-105">
                        <p className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>{day.day}</p>
                        <div className="text-3xl mb-2">{getWeatherIcon(day.icon)}</div>
                        <p className={`text-lg font-bold ${darkMode ? 'text-sky-400' : 'text-sky-600'}`}>{day.temp}°C</p>
                        <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{day.conditions}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ===== MOBILE LAYOUT (below lg screens) ===== */}
              <div className="lg:hidden">
                <div className="max-w-md mx-auto">
                  {/* Hero Section */}
                  <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-1 text-sm mb-2">
                      <MapPin className={`w-4 h-4 ${darkMode ? 'text-sky-400' : 'text-sky-600'}`} />
                      <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{weather.location}</span>
                    </div>
                    <div className="text-8xl mb-3">{getWeatherIcon(weather.icon)}</div>
                    <div className={`text-6xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      {weather.temp}°
                    </div>
                    <div className={`text-lg mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {weather.conditions}
                    </div>
                    <div className={`text-sm mt-2 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                      Feels like {weather.feelsLike}°
                    </div>
                  </div>

                  {/* Stats Grid - 2x2 layout on mobile */}
                  <div className="grid grid-cols-2 gap-3 mb-8">
                    <div className={`p-4 rounded-2xl text-center ${darkMode ? 'bg-gray-800/50 backdrop-blur-sm' : 'bg-white/50 backdrop-blur-sm'}`}>
                      <div className="text-2xl mb-1">🌡️</div>
                      <div className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{weather.feelsLike}°</div>
                      <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Feels Like</div>
                    </div>

                    <div className={`p-4 rounded-2xl text-center ${darkMode ? 'bg-gray-800/50 backdrop-blur-sm' : 'bg-white/50 backdrop-blur-sm'}`}>
                      <div className="text-2xl mb-1">💧</div>
                      <div className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{weather.humidity}%</div>
                      <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Humidity</div>
                    </div>

                    <div className={`p-4 rounded-2xl text-center ${darkMode ? 'bg-gray-800/50 backdrop-blur-sm' : 'bg-white/50 backdrop-blur-sm'}`}>
                      <div className="text-2xl mb-1">💨</div>
                      <div className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{weather.windspeed}</div>
                      <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Wind (km/h)</div>
                    </div>

                    <div className={`p-4 rounded-2xl text-center ${darkMode ? 'bg-gray-800/50 backdrop-blur-sm' : 'bg-white/50 backdrop-blur-sm'}`}>
                      <div className="text-2xl mb-1">🌡️</div>
                      <div className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{weather.temp}°</div>
                      <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Current</div>
                    </div>
                  </div>

                  {/* 5-Day Forecast - Grid (no horizontal scroll) */}
                  <div>
                    <h3 className={`text-lg font-semibold mb-3 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      <Cloud className="w-5 h-5" /> 5-Day Forecast
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                      {weather.days.map((day, idx) => (
                        <div key={idx} className={`p-3 rounded-2xl text-center ${darkMode ? 'bg-gray-800/50 backdrop-blur-sm' : 'bg-white/50 backdrop-blur-sm'
                          }`}>
                          <div className={`font-semibold mb-1 text-sm ${darkMode ? 'text-white' : 'text-gray-800'}`}>{day.day}</div>
                          <div className="text-2xl mb-1">{getWeatherIcon(day.icon)}</div>
                          <div className={`text-base font-bold ${darkMode ? 'text-sky-400' : 'text-sky-600'}`}>{day.temp}°</div>
                          <div className={`text-xs hidden sm:block mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>{day.conditions}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;