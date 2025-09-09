import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ImportRekonsiliasi } from '../../../../../../services';
import { useRouter } from 'next/navigation';
import { toast } from '@/components/ui/use-toast';
import { stringifyError } from '../../../../../../helper';

const ImportRekonsiliasiComponent: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter()


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (selectedFile) {
      setIsLoading(true);
      const formData = new FormData();
      formData.append('file', selectedFile);

      try {
        const response = await ImportRekonsiliasi(router,formData)
        toast({
          title: 'File berhasil diupload!'
        })
        console.log('File uploaded successfully', response.data);
      } catch (error:any) {
        console.error('Error uploading file', error);
        toast({
            title: error.response?.data 
                ? stringifyError(error.response?.data.error)
                : error.message,
            variant: 'destructive'
        })
      } finally {
        setIsLoading(false);
      }
    } else {
      console.log('No file selected');
    }
  };

  return (
      <div className="w-full">
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="mt-6 text-center">
                <a
                className="inline-block px-4 py-2 text-indigo-600 bg-indigo-100 rounded hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                href='https://verifikasilpu.kominfo.go.id/file/storage/template_excel/rekonsiliasi_ref.xlsx'
                download
                target='_blank'
                >
                Download Template
                </a>
            </div>
          <div>
            <label htmlFor="fileInput" className="block mb-2 text-sm font-medium text-gray-300">
              Select file to upload:
            </label>
            <input
              type="file"
              id="fileInput"
              onChange={handleFileChange}
              className="block w-full px-3 py-2 text-gray-200 bg-gray-900 border border-gray-600 rounded-xl focus:outline-none focus:ring focus:ring-indigo-400 focus:border-indigo-400"
            />
          </div>
          {selectedFile && (
            <div className="mt-4 text-sm text-gray-300">
              Selected file: <strong>{selectedFile.name}</strong>
            </div>
          )}
          <div className="pt-6">
            <Button
              type="submit"
              className="w-full py-4"
            >
              Upload
            </Button>
          </div>
        </form>
      </div>
  );
};

export default ImportRekonsiliasiComponent;
