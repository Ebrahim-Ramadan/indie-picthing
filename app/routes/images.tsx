import React from 'react';
import { useLoaderData } from '@remix-run/react';
import { json, LoaderFunctionArgs, redirect } from '@remix-run/node';
import { deleteImage, getImageListItems } from '~/models/image.server';
import { requireUserId } from '~/session.server';
import { safeRedirect } from '~/utils';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const userID = await requireUserId(request);
    console.log('userID', userID);
    
    const images = await getImageListItems({ userID });
    console.log('images', images);
    
    if (!images || images.length === 0) {
      return json({ userID, images: [] });
    }
    
    return json({ userID, images });
  } catch (error) {
    console.error('Error in loader:', error);
    
    if (error instanceof Response && error.status === 302) {
      // If it's a redirect response, throw it to let Remix handle it
      throw error;
    }
    
    // For other errors, return a JSON response with an error message
    return json({ error: 'Failed to load images' }, { status: 500 });
  }
};

export const Images = () => {
  const data = useLoaderData<typeof loader>();

  const handleDelete = async (id: string) => {
    try {
      await deleteImage({ id, userId: data.userID });
      // Optionally, you might want to refresh the list or handle the deleted state
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  return (
    <div>
      <p>Images for {data.userID}</p>
      <div>
        {data?.images?.map((image: any) => (
          <div key={image.id}>
            <img src={image.originalUrl} alt={image.originalUrl} />
            <button onClick={() => handleDelete(image.id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Images;