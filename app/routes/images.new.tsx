import type { ActionFunction } from "@remix-run/node";
import { json, unstable_parseMultipartFormData } from "@remix-run/node";
import { Form, MetaFunction, useActionData, useNavigation, useSubmit } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import { X, Upload, Loader2 } from "lucide-react";
import { createImage, deleteImage } from "~/models/image.server";
import { requireUserId } from "~/session.server";
import { uploadHandler } from "~/utils.server";

type ActionData =
  | { success: true; imageId: string; originalUrl: string; bgRemovedUrl: string }
  | { success: true }
  | { errors: { image: string } };

export const action: ActionFunction = async ({ request }) => {
  // console.log("Action function called");
  const userId = await requireUserId(request);

  try {
    const contentType = request.headers.get("Content-Type") || "";
    // console.log("Content-Type:", contentType);

    if (!contentType.includes("multipart/form-data")) {
      return json<ActionData>(
        { errors: { image: "Form submission must be multipart/form-data" } },
        { status: 400 }
      );
    }

    const formData = await unstable_parseMultipartFormData(request, uploadHandler);
    // console.log("Form data parsed:", Array.from(formData.entries()));

    const intent = formData.get("intent");
    // console.log("Intent:", intent);

    if (intent === "delete") {
      const imageId = formData.get("imageId");
      if (typeof imageId === "string") {
        await deleteImage({ id: imageId, userId });
        return json<ActionData>({ success: true });
      }
      return json<ActionData>(
        { errors: { image: "Image ID is required for deletion" } },
        { status: 400 }
      );
    }

    const image = formData.get("image");
    // console.log("Image:", image);

    if (typeof image === "string" && image.startsWith("/uploads/")) {
      const createdImage = await createImage({
        originalUrl: image,
        userId,
      });

      // Simulate background removal process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const bgRemovedUrl = `/uploads/${image.split("/").pop()}`;

      return json<ActionData>({ 
        success: true, 
        imageId: createdImage.id, 
        originalUrl: createdImage.originalUrl, 
        bgRemovedUrl 
      });
    }

    console.log('No valid image file');
    return json<ActionData>(
      { errors: { image: "A valid image file is required" } },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error in action function:", error);
    return json<ActionData>(
      { errors: { image: `An error occurred while processing the image:` } },
      { status: 500 }
    );
  }
};

export default function NewImagePage() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const submit = useSubmit();
  const [dragActive, setDragActive] = useState(false);
  const [images, setImages] = useState<Array<{ id: string, originalUrl: string, bgRemovedUrl: string }>>([]);
  const [processing, setProcessing] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    console.log("Action data changed:", actionData);
    if (actionData && 'success' in actionData && actionData.success && 'imageId' in actionData) {
      setImages(prev => [...prev, { 
        id: actionData.imageId, 
        originalUrl: actionData.originalUrl, 
        bgRemovedUrl: actionData.bgRemovedUrl 
      }]);
      setProcessing(null);
    } else if (actionData && 'errors' in actionData) {
      console.error("Error from action:", actionData.errors);
      setProcessing(null);
    }
  }, [actionData]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    console.log("File input changed");
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (files: FileList) => {
    const formData = new FormData();
    formData.append("image", files[0]);
    formData.append("intent", "upload");
    setProcessing(files[0].name);
    submit(formData, { 
      method: "post", 
      encType: "multipart/form-data",
      replace: true
    });
  };

  const handleDelete = (imageId: string) => {
    const formData = new FormData();
    formData.append("intent", "delete");
    formData.append("imageId", imageId);
    submit(formData, { method: "post", encType: "multipart/form-data" });
    setImages(prev => prev.filter(img => img.id !== imageId));
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Image Upload and Processing</h1>
      <Form
        ref={formRef}
        method="post"
        encType="multipart/form-data"
        onDragEnter={handleDrag}
        className="mb-8"
      >
        <div 
          className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer ${
            dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
          }`}
        >
          <input
            type="file"
            name="image"
            accept="image/*"
            onChange={handleChange}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-full">
            <Upload className="w-10 h-10 mb-3 text-gray-400" />
            <p className="mb-2 text-sm text-gray-500">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500">PNG, JPG or GIF (MAX. 800x400px)</p>
          </label>
        </div>
        {dragActive && 
          <div 
            className="absolute inset-0 w-full h-full" 
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          ></div>
        }
      </Form>

      {actionData && 'errors' in actionData && actionData.errors.image && (
        <p className="text-red-500 mt-2">{actionData.errors.image}</p>
      )}

      <div className="grid grid-cols-2 gap-4">
        {images.map((image) => (
          <div key={image.id} className="relative">
            <img src={image.bgRemovedUrl} alt="Processed" className="w-full h-48 object-cover rounded-md" />
            <button
              onClick={() => handleDelete(image.id)}
              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
        {processing && (
          <div className="flex items-center justify-center w-full h-48 bg-gray-100 rounded-md">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <span className="ml-2 text-sm text-gray-500">Processing {processing}...</span>
          </div>
        )}
      </div>
    </div>
  );
}

  export const meta: MetaFunction = () => {
    return [
      { title: "Upload new Image for the heaven" },
      {
        property: "og:title",
        content: "Very cool app",
      },
      {
        name: "description",
        content: "This app is the best",
      },
    ];
  };