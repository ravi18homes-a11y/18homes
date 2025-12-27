"use client"
import React from 'react'

function Values() { 
    return (
        <div>
            <section className="w-full bg-[#F5F5F5] lg:py-16 py-10 ">
                <div className="max-w-[1420px] mx-auto px-18">

                    {/* Title */}
                    <h2 className="text-center text-[48px] font-bold text-black mb-14">
                        Values
                    </h2>

                    {/* GRID */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                        {/* CARD 1 */}
                        <div className="bg-white py-10 pb-12 px-7 transition-all duration-300 hover:-translate-y-2">
                            <h3 className="text-[24px] font-bold text-black-700 mb-3">
                                Customer-Centered
                            </h3>
                            <p className="text-[20px]  text-#101010 ">
                                We put our clients first, always listening to their needs and
                                tailoring our services to create the perfect vibe for their event.
                            </p>
                        </div>

                        {/* CARD 2 */}
                        <div className="bg-white py-10 pb-14 px-7  transition-all duration-300 hover:-translate-y-2">
                            <h3 className="text-[24px] font-bold text-black-700 mb-3">
                                Reliability
                            </h3>
                            <p className="text-[20px]  text-#101010-700">
                                We show up on time, fully prepared, and ready to make every event
                                a success. Our word is our commitment.
                            </p>
                        </div>

                        {/* CARD 3 */}
                        <div className="bg-white py-10 pb-14 px-7 transition-all duration-300 hover:-translate-y-2">
                            <h3 className="text-[24px] font-bold text-black-700 mb-3">
                                Passion for music
                            </h3>
                            <p className="text-[20px]  text-#101010-700">
                                We are deeply passionate about music and its power to connect people,
                                creating memorable moments that last a lifetime.
                            </p>
                        </div>

                        {/* CARD 4 */}
                        <div className="bg-white py-10 pb-14 px-7 transition-all duration-300 hover:-translate-y-2">
                            <h3 className="text-[24px] font-bold text-black-700 mb-3">
                                Professionalism
                            </h3>
                            <p className="text-[20px]  text-#101010-700">
                                We maintain a high standard of professionalism, from our appearance
                                to our interactions, ensuring a smooth and enjoyable experience
                                for all involved.
                            </p>

                        </div>

                        {/* CARD 5 */}
                        <div className="bg-white py-10 pb-14 px-7 transition-all duration-300 hover:-translate-y-2">
                            <h3 className="text-[24px] font-bold text-black-700 mb-3">
                                Flexibility
                            </h3>
                            <p className="text-[20px]  text-#101010-700">
                                We adapt to any situation, remaining calm under pressure and ready
                                to make adjustments to keep the energy flowing and the crowd engaged.
                            </p>
                        </div>

                        {/* CARD 6 */}
                        <div className="bg-white py-10 pb-14 px-7 transition-all duration-300 hover:-translate-y-2">
                            <h3 className="text-[24px] font-bold text-black-700 mb-3">
                                Integrity
                            </h3>
                            <p className="text-[20px]  text-#101010-700">
                                We believe in being honest, transparent, and ethical in all our
                                business dealings, always delivering on our promises.
                            </p>
                        </div>

                    </div>
                </div>
            </section>

        </div>
    )
}

export default Values
