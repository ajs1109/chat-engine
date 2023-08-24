
import axios from 'axios'
import { Input } from './input'

const ImageUpload = () => {
    const preset_key = ''
    const cloud_name = ''

    function handleFile(event:any){
        const file = event.target.files[0];
        const formData = new FormData();
        formData.append('file', file)
        formData.append('upload_preset',preset_key);
        axios.post(`https://api.cloudinary.com/${cloud_name}/images/upload`, formData).then(res => console.log(res)).catch(err => console.log(err));
    }

  return (
    <div>
        <Input type="file" name="image" id="" onChange={handleFile} />
    </div>
  )
}

export default ImageUpload