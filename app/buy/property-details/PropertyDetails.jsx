"use client"
import React, { useState } from 'react';
import { ArrowLeft, MapPin, Bed, Bath, Square, Heart, Phone, Mail, Share2, Calendar, Home, CheckCircle, Play } from 'lucide-react';

const PropertyDetailsPage = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [currentVideo, setCurrentVideo] = useState(null);

  // Sample property data - यह backend से आएगा
  const property = {
    id: 1,
    title: 'आधुनिक 3BHK फ्लैट',
    location: 'सेक्टर 62, नोएडा',
    price: 8500000,
    bedrooms: 3,
    bathrooms: 2,
    area: 1450,
    type: 'apartment',
    status: 'Ready to Move',
    featured: true,
    description: 'यह एक शानदार 3BHK फ्लैट है जो सेक्टर 62, नोएडा में स्थित है। यह प्रॉपर्टी आधुनिक सुविधाओं से लैस है और तुरंत रहने के लिए तैयार है। इस फ्लैट में विशाल कमरे, मॉडर्न किचन, और बालकनी है। यह एक प्रतिष्ठित सोसाइटी में स्थित है जहाँ 24/7 सुरक्षा, पार्किंग, पार्क, और जिम जैसी सुविधाएं उपलब्ध हैं।',
    mainImage: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200',
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
      'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800'
    ],
    videos: [
      {
        id: 1,
        title: 'प्रॉपर्टी टूर',
        thumbnail: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400',
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
      },
      {
        id: 2,
        title: 'सोसाइटी का दृश्य',
        thumbnail: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400',
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
      }
    ],
    amenities: [
      '24/7 सुरक्षा',
      'पावर बैकअप',
      'लिफ्ट',
      'पार्किंग',
      'पार्क',
      'जिम',
      'क्लब हाउस',
      'स्विमिंग पूल'
    ],
    nearbyPlaces: [
      { name: 'मेट्रो स्टेशन', distance: '1.5 km' },
      { name: 'स्कूल', distance: '500 m' },
      { name: 'अस्पताल', distance: '2 km' },
      { name: 'शॉपिंग मॉल', distance: '1 km' }
    ],
    agent: {
      name: 'राजेश कुमार',
      phone: '+91 98765 43210',
      email: 'rajesh@example.com',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200'
    }
  };

  const formatPrice = (price) => {
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
    return `₹${(price / 100000).toFixed(2)} Lac`;
  };

  const openVideo = (video) => {
    setCurrentVideo(video);
    setShowVideoModal(true);
  };

  return (
    <div className="min-h-screen mt-20 bg-gray-50">
      {/* Back Button */}
      <div className="bg-white  sticky top-20 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button 
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-gray-700 hover:text-red-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">वापस जाएं</span>
          </button>
        </div>
      </div>

      {/* Hero Image Section */}
      <div className="relative h-[500px] bg-gray-900">
        <img 
          src={property.mainImage} 
          alt={property.title}
          className="w-full h-full object-cover opacity-90"
        />
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={() => setIsFavorite(!isFavorite)}
            className="p-3 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
          >
            <Heart
              className={`w-6 h-6 ${isFavorite ? 'fill-red-600 text-red-600' : 'text-gray-600'}`}
            />
          </button>
          <button className="p-3 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors">
            <Share2 className="w-6 h-6 text-gray-600" />
          </button>
        </div>
        
        {property.featured && (
          <span className="absolute top-4 left-4 px-4 py-2 bg-red-600 text-white font-semibold rounded-full">
            Featured
          </span>
        )}
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Property Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title and Price */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-800 mb-2">{property.title}</h1>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-5 h-5 mr-2" />
                    <span className="text-lg">{property.location}</span>
                  </div>
                </div>
                <span className={`px-4 py-2 rounded-full text-white font-semibold ${
                  property.status === 'Ready to Move' ? 'bg-green-600' : 'bg-orange-600'
                }`}>
                  {property.status}
                </span>
              </div>
              
              <div className="flex items-center gap-6 py-4 border-t border-b">
                <div className="flex items-center gap-2">
                  <Bed className="w-5 h-5 text-gray-600" />
                  <span className="font-semibold">{property.bedrooms} BHK</span>
                </div>
                <div className="flex items-center gap-2">
                  <Bath className="w-5 h-5 text-gray-600" />
                  <span className="font-semibold">{property.bathrooms} बाथरूम</span>
                </div>
                <div className="flex items-center gap-2">
                  <Square className="w-5 h-5 text-gray-600" />
                  <span className="font-semibold">{property.area} sqft</span>
                </div>
              </div>
              
              <div className="mt-4">
                <span className="text-4xl font-bold text-red-600">{formatPrice(property.price)}</span>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">विवरण</h2>
              <p className="text-gray-700 leading-relaxed">{property.description}</p>
            </div>

            {/* Videos */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">वीडियो टूर</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {property.videos.map(video => (
                  <div 
                    key={video.id}
                    className="relative cursor-pointer group"
                    onClick={() => openVideo(video)}
                  >
                    <img 
                      src={video.thumbnail} 
                      alt={video.title}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-40 rounded-lg flex items-center justify-center group-hover:bg-opacity-50 transition-all">
                      <Play className="w-16 h-16 text-white" />
                    </div>
                    <p className="mt-2 font-semibold text-gray-800">{video.title}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Image Gallery */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">फोटो गैलरी</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {property.images.map((image, index) => (
                  <img 
                    key={index}
                    src={image} 
                    alt={`Property ${index + 1}`}
                    className="w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => setCurrentImageIndex(index)}
                  />
                ))}
              </div>
            </div>

            {/* Amenities */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">सुविधाएं</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {property.amenities.map((amenity, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-gray-700">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Nearby Places */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">आसपास की जगहें</h2>
              <div className="space-y-3">
                {property.nearbyPlaces.map((place, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                    <span className="text-gray-700 font-medium">{place.name}</span>
                    <span className="text-gray-600">{place.distance}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Contact Agent */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h3 className="text-xl font-bold text-gray-800 mb-4">एजेंट से संपर्क करें</h3>
              
              <div className="flex items-center gap-4 mb-6">
                <img 
                  src={property.agent.image} 
                  alt={property.agent.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold text-gray-800">{property.agent.name}</p>
                  <p className="text-sm text-gray-600">प्रॉपर्टी एजेंट</p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <a 
                  href={`tel:${property.agent.phone}`}
                  className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Phone className="w-5 h-5 text-red-600" />
                  <span className="text-gray-700">{property.agent.phone}</span>
                </a>
                
                <a 
                  href={`mailto:${property.agent.email}`}
                  className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Mail className="w-5 h-5 text-red-600" />
                  <span className="text-gray-700">{property.agent.email}</span>
                </a>
              </div>

              <button className="w-full py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-2">
                <Calendar className="w-5 h-5" />
                साइट विजिट बुक करें
              </button>

              <button className="w-full mt-3 py-3 border-2 border-red-600 text-red-600 rounded-lg font-semibold hover:bg-red-50 transition-colors">
                अभी पूछताछ करें
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Video Modal */}
      {showVideoModal && currentVideo && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
          onClick={() => setShowVideoModal(false)}
        >
          <div 
            className="bg-white rounded-lg max-w-4xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-xl font-bold">{currentVideo.title}</h3>
              <button 
                onClick={() => setShowVideoModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>
            <div className="aspect-video">
              <iframe
                src={currentVideo.url}
                className="w-full h-full"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyDetailsPage;