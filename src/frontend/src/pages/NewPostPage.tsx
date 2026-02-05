import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useCreatePost } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Upload, X, ArrowLeft } from 'lucide-react';
import { WritingType, PostVisibility } from '../backend';
import { toast } from 'sonner';
import { convertImageToBlob } from '../lib/imageUpload';
import ImageCropper from '../components/posts/ImageCropper';

export default function NewPostPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const createPost = useCreatePost();

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [writingType, setWritingType] = useState<WritingType>(WritingType.poetry);
  const [visibility, setVisibility] = useState<PostVisibility>(PostVisibility.publicPost);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showCropper, setShowCropper] = useState(false);
  const [croppedBlob, setCroppedBlob] = useState<Blob | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setShowCropper(true);
        setCroppedBlob(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (blob: Blob) => {
    setCroppedBlob(blob);
    setShowCropper(false);
    
    // Update preview with cropped image
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(blob);
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setImageFile(null);
    setImagePreview(null);
    setCroppedBlob(null);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setUploadProgress(0);
    setCroppedBlob(null);
    setShowCropper(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!identity) {
      toast.error('Please log in to create a post');
      return;
    }

    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    if (!imageFile) {
      toast.error('Please upload an image of your handwriting');
      return;
    }

    if (!croppedBlob) {
      toast.error('Please crop your image before publishing');
      return;
    }

    try {
      const imageBlob = await convertImageToBlob(croppedBlob, (progress) => {
        setUploadProgress(progress);
      });

      const postId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      await createPost.mutateAsync({
        id: postId,
        title: title.trim(),
        message: message.trim() || null,
        image: imageBlob,
        writingType,
        visibility,
      });

      toast.success('Your post has been published!');
      navigate({ to: '/' });
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post. Please try again.');
    }
  };

  if (!identity) {
    return (
      <div className="max-w-2xl mx-auto">
        <Button onClick={() => navigate({ to: '/' })} variant="ghost" className="mb-6 -ml-2">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Feed
        </Button>
        <Alert>
          <AlertDescription className="text-center py-8">
            <p className="text-lg mb-4">Please log in to share your writing</p>
            <p className="text-sm text-muted-foreground">
              You need to be authenticated to create a new post.
            </p>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Button onClick={() => navigate({ to: '/' })} variant="ghost" className="mb-6 -ml-2">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Feed
      </Button>

      {showCropper && imageFile && imagePreview ? (
        <ImageCropper
          imageFile={imageFile}
          imagePreview={imagePreview}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-serif">Share Your Writing</CardTitle>
            <CardDescription>
              Upload a photo of your handwritten poetry or prose to share with the world
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="writingType">Type</Label>
                <Select
                  value={writingType}
                  onValueChange={(value) => setWritingType(value as WritingType)}
                >
                  <SelectTrigger id="writingType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={WritingType.poetry}>Poetry</SelectItem>
                    <SelectItem value={WritingType.prose}>Prose</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter a title for your writing"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message (optional)</Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Add a short message or context for your writing"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="visibility">Visibility</Label>
                <Select
                  value={visibility}
                  onValueChange={(value) => setVisibility(value as PostVisibility)}
                >
                  <SelectTrigger id="visibility">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={PostVisibility.publicPost}>Public</SelectItem>
                    <SelectItem value={PostVisibility.linkOnly}>Link-only</SelectItem>
                    <SelectItem value={PostVisibility.privatePost}>Private</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {visibility === PostVisibility.publicPost && 'Visible to everyone in the feed'}
                  {visibility === PostVisibility.linkOnly && 'Only accessible via direct link'}
                  {visibility === PostVisibility.privatePost && 'Only visible to you'}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Handwritten Image *</Label>
                {!imagePreview ? (
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                    <input
                      type="file"
                      id="image"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <label htmlFor="image" className="cursor-pointer">
                      <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-sm font-medium mb-1">Click to upload an image</p>
                      <p className="text-xs text-muted-foreground">PNG, JPG, or JPEG</p>
                    </label>
                  </div>
                ) : (
                  <div className="relative border rounded-lg overflow-hidden">
                    <div className="manuscript-frame">
                      <img src={imagePreview} alt="Preview" className="w-full h-auto" />
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={handleRemoveImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    {croppedBlob && (
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="absolute bottom-2 left-2"
                        onClick={() => setShowCropper(true)}
                      >
                        Adjust Crop
                      </Button>
                    )}
                    {uploadProgress > 0 && uploadProgress < 100 && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted">
                        <div
                          className="h-full bg-primary transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={createPost.isPending || !title.trim() || !imageFile || !croppedBlob}
                  className="flex-1"
                >
                  {createPost.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    'Publish Post'
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate({ to: '/' })}
                  disabled={createPost.isPending}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
