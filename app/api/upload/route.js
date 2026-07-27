import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No file received.' }, { status: 400 });
    }

    const cloudFormData = new FormData();
    cloudFormData.append('file', file);
    cloudFormData.append('upload_preset', '18homes_unsigned');
    cloudFormData.append('folder', '18homes/services');

    const res = await fetch('https://api.cloudinary.com/v1_1/domwj0m7s/image/upload', {
      method: 'POST',
      body: cloudFormData,
    });

    const data = await res.json();

    if (!res.ok || !data.secure_url) {
      console.error('Cloudinary upload error details:', data);
      return NextResponse.json(
        { error: data.error?.message || 'Failed to upload image to Cloudinary.' },
        { status: res.status || 500 }
      );
    }

    return NextResponse.json({ url: data.secure_url });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: 'Failed to upload image.' }, { status: 500 });
  }
}
