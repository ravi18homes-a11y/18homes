"use client";
import React from "react";
 
function MissionVisson() {
  return (
    <div>
      <section className="w-full bg-[#1B1333] py-20 relative">
        <div className="max-w-[1500px] mx-auto px-5  md:px-28 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* LEFT — ONE FULL LARGE IMAGE */}
          <div className="w-full">
            <img
              src="https://res.cloudinary.com/dxlykgx6w/image/upload/v1765113787/18home_nfbc2b.jpg"
              alt="DJ"
              className="w-full h-full rounded-[40px] object-cover"
            />
          </div>

          {/* RIGHT — TEXT BLOCK */}
          <div className="flex flex-col gap-5">
            {/* Mission */}
            <div className="border-3 border-[#FFFFFF] rounded-2xl p-10 text-white">
              <h2 className="text-[24px] font-semibold mb-4">हमारा मिशन</h2>
              <p className="text-[17px]  text-white/80">
                18Homes में हमारा मिशन है आपके लिए एक आसान और भरोसेमंद
                प्लेटफ़ॉर्म प्रदान करना, जहाँ आप अपने बजट और जरूरत के अनुसार
                कमरे और फ्लैट आसानी से खोज और किराए पर ले सकें। चाहे आप एक
                स्टूडेंट हों, नौकरीपेशा हों, या परिवार के लिए जगह ढूंढ रहे हों,
                हम आपको सही विकल्प दिखाने और तेज़ी से बुकिंग करने में मदद करते
                हैं। हमारा लक्ष्य है सुरक्षित, पारदर्शी और ग्राहक-केंद्रित सेवा
                देना, जिससे आपका घर खोजने का अनुभव सरल और सुखद हो।
              </p>
            </div>

            {/* Vision */}
            <div className="border-3 border-[#FFFFFF] rounded-2xl p-10 text-white">
              <h2 className="text-[24px] font-semibold mb-4">हमारा विज़न</h2>
              <p className="text-[17px]  text-white/80">
                हमारा विज़न है कि 18Homes भारत के सबसे भरोसेमंद रियल एस्टेट
                प्लेटफ़ॉर्म में से एक बने। हम चाहते हैं कि हर व्यक्ति, चाहे वह
                पहली बार किराए पर फ्लैट ले रहा हो या नया घर खोज रहा हो, हमारी
                वेबसाइट पर आसानी से अपने लिए सही विकल्प खोज सके। हम व्यक्तिगत
                सहायता, विश्वसनीयता और व्यापक विकल्पों के माध्यम से आपके घर
                खोजने के अनुभव को सरल, सुरक्षित और अनोखा बनाना चाहते हैं।
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default MissionVisson;
