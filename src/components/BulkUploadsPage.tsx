import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BulkUpload from './BulkUpload';
import BulkLoaneeUpload from './BulkLoaneeUpload';

const BulkUploadsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Bulk Uploads</h1>
      
      <Tabs defaultValue="loans" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="loans">Loans</TabsTrigger>
          <TabsTrigger value="repayments">Repayments</TabsTrigger>
          <TabsTrigger value="loanees">Loanees</TabsTrigger>
        </TabsList>
        <TabsContent value="loans" className="mt-4">
          <BulkUpload type="loans" />
        </TabsContent>
        <TabsContent value="repayments" className="mt-4">
          <BulkUpload type="repayments" />
        </TabsContent>
        <TabsContent value="loanees" className="mt-4">
          <BulkLoaneeUpload />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BulkUploadsPage;
