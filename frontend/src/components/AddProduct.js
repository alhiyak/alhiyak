import React, { useState } from 'react';
import axios from 'axios';

function AddProduct() {
    const [image, setImage] = useState(null);
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');

    const handleImageChange = (e) => {
        setImage(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!image) {
            alert('اختر صورة أولاً');
            return;
        }

        const formData = new FormData();
        formData.append('product_image', image);

        try {
            const uploadRes = await axios.post(
                'http://localhost/البرنامج_المتكامل/backend/upload_product_image.php',
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            );

            const data = uploadRes.data; // هذا JSON الآن

            if (data.success) {
                // نجاح المعالجة
                const productData = {
                    name,
                    price,
                    image_path: data.path, // المسار الجديد
                };
                // هنا أرسل productData إلى API حفظ المواد (إذا موجود)
                alert('تمت إضافة المادة بنجاح');
                setName('');
                setPrice('');
                setImage(null);
            } else {
                alert('فشلت معالجة الصورة: ' + (data.error || data.message));
            }
        } catch (error) {
            console.error(error);
            alert('حدث خطأ في الاتصال بالسيرفر');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                placeholder="اسم المادة"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
            />
            <input
                type="number"
                placeholder="السعر"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
            />
            <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                required
            />
            <button type="submit">إضافة المادة</button>
        </form>
    );
}

export default AddProduct;