'use client'
import { Button } from "@/components/ui/button"
import { useEffect, useRef, useState } from "react"
import { toast } from "react-toastify";
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CropperRef, Cropper } from 'react-advanced-cropper';
import 'react-advanced-cropper/dist/style.css'
import { updateUser, uploadFile } from "@/utils/api"
import { useGlobalContext } from "@/context/global-context";
const Profile = () => {
    const avatarRef = useRef<HTMLInputElement>(null);
    const { user, setUser } = useGlobalContext();
    const [imgFile, setImgFile] = useState<File>();
    const [fileInfo, setFileInfo] = useState<{ name: string, type: string }>();
    const cropperRef = useRef<CropperRef>(null);
    const [image, setImage] = useState<string>("");
    const [preview, setPreview] = useState<string>("");
    const [name, setName] = useState<string>("");
    const [open, setOpen] = useState(false);

    useEffect(() => {
        setName(user?user.name:"")
        setPreview(user?user.avatar:"")
    }, [user])

    const onChooseImage = () => {
        if (avatarRef.current?.files![0]) {
            // console.log(avatarRef.current?.files![0]);
            const file = avatarRef.current.files[0];
            setOpen(true);
            setFileInfo(file)
            const url = URL.createObjectURL(file)
            setImage(url);
        }
    }
    const onCrop = () => {
        setOpen(false);
        if (cropperRef.current && avatarRef.current) {
            avatarRef.current.value = '';
            const canvas = cropperRef.current.getCanvas({ width: 128, height: 128 });
            if (canvas) {
                canvas.toBlob(blob => {
                    blob && setImgFile(new File([blob], fileInfo?.name!, { type: 'image/png' }));
                }, 'image/png');
                setPreview(canvas.toDataURL());
            }
        }
    }
    const onCancel = () => {
        setOpen(false);
        setImgFile(avatarRef.current?.files![0]);
        setPreview(image);
    }

    const SaveProfile = async () => {
        if (!name) {
            toast.warn("Input the your name!");
            return;
        }
        if (!preview || !imgFile) {
            toast.warn("Choose the your avatar!");
            return;
        }

        const avatar = await uploadFile(imgFile, fileInfo?.name!, fileInfo?.type, 'avatar');
        try {
            const res = await updateUser(name, avatar);
            if (res) {
                setUser({email: user? user.email: "", name, avatar})
                toast.success("Profile updated successfully!");
            }
        }
        catch (error) {
            console.error(error);
            toast.error("Failed to update the profile!");
            return;
        }
    }

    return (
        <div className="flex flex-col gap-8 px-16 py-16 w-[50rem] mx-auto">
            <div className="w-full flex flex-col gap-8 justify-center items-center">
                <div className="w-full flex justify-center relative mb-60">
                    <Input type="file" ref={avatarRef} accept="image/png" onChange={onChooseImage} className="mt-4 border border-gray h-56 w-56 rounded-full object-contain absolute z-10 opacity-0" />
                    {preview ? <img
                        src={preview}
                        className="mt-4 border h-56 aspect-[1/1] rounded-full object-contain absolute"
                    /> : <div className="mt-4 border border-[#afafaf5c] bg-[#090909] h-56 aspect-[1/1] rounded-full absolute"></div>}
                </div>
                <div className="w-2/5 flex flex-col items-center gap-4">
                    <div className="w-full">
                        <Input placeholder="Your name" value={name} onChange={e => setName(e.target.value)} className="bg-[#090909]"/>
                    </div>
                </div>
            </div>
            <div className="w-full flex justify-center">
                <Button onClick={SaveProfile} className="w-2/5 hover:to-[#ba4bff] hover:from-[#ba4bff] rounded-full bg-gradient-to-r to-[#351166] from-[#b55ced]">Save Profile</Button>
            </div>
            <Dialog open={open} modal={true} >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Crop Image</DialogTitle>
                        <DialogDescription></DialogDescription>
                    </DialogHeader>
                    <Cropper
                        ref={cropperRef}
                        src={image}
                        stencilProps={{
                            aspectRatio: 1
                        }}
                    />
                    <DialogFooter>
                        <Button onClick={onCrop}>Crop</Button>
                        <Button onClick={onCancel}>Uncrop</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>)

}
export default Profile;