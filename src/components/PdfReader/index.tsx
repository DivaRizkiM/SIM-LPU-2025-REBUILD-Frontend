'use client';

import { FC, useState } from 'react';
import { pdfjs, Document, Page } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

import { Button, buttonVariants } from '../ui/button';
import { ChevronLeft, ChevronRight, DownloadCloud } from 'lucide-react';

pdfjs.GlobalWorkerOptions.workerSrc =
  window.location.origin + "/pdf.worker.min.mjs";

type PDFFile = string | File | null;

interface IPdfReader{
    urlFile: PDFFile
}
const PdfReader:FC<IPdfReader> = ({urlFile}) => {
  const [numPages, setNumPages] = useState<number>();
  const [pageNumber, setPageNumber] = useState<number>(1);

  function onDocumentLoadSuccess({ numPages: nextNumPages }: any): void {
    setNumPages(nextNumPages);
  }
  

  return (
    <div className="relative w-full lg:border rounded-lg h-max px-1"  id='doc_viewer'>
        <div className="Example__container flex flex-col lg:items-center overflow-x-scroll min-h-[842px]">
            <div className="Example__container__document relative">
                <Document
                    className={'w-full mt-3 max-w-[calc(100%-2em)]'}
                    file={urlFile} 
                    onLoadSuccess={onDocumentLoadSuccess}
                >
                        <Page
                        className={'rounded overflow-hidden border'}
                        pageNumber={pageNumber} />
                </Document>
            </div>
        </div>
        <div className="sticky z-50 bottom-28 lg:bottom-24 my-2 flex items-center w-full max-w-[529px] justify-evenly lg:justify-normal mx-auto">
            <div className='flex w-fit py-1 lg:py-2 px-2 lg:px-4 rounded-xl justify-center items-center bg-slate-800/70 text-white lg:mx-auto'>
                <Button 
                disabled={pageNumber !== 1 ? false : true}
                size={"icon"}
                onClick={()=>setPageNumber( pageNumber - 1)}>
                    <ChevronLeft className='w-4 h-4 lg:w-auto lg:h-auto stroke-white'/>
                </Button>
                <span className="mx-2 text-xs">Page {pageNumber} of {numPages}</span>
                <Button
                disabled={pageNumber !== numPages ? false : true}
                size={"icon"}
                onClick={()=>setPageNumber(pageNumber + 1)}
                >
                    <ChevronRight className='w-4 h-4 lg:w-auto lg:h-auto stroke-white'/>
                </Button>
            </div>
            <div className='w-fit lg:absolute lg:right-0'>
                <a
                    href={`${urlFile}`}
                    target='_blank'
                    className={buttonVariants(
                        {
                            size: 'icon',
                            variant: 'secondary'
                        }
                    )}
                >
                    <DownloadCloud className='w-4 h-4 lg:w-auto lg:h-auto'/>
                </a>
            </div>
        </div>
    </div>
  );
}

export default PdfReader