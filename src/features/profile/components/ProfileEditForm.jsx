import {
  Loader2,
  Lock,
  Save,
  X,
} from 'lucide-react';

import { scrollToFirstError } from '@/lib/formErrors';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const ProfileEditForm = ({ form, user, loading, onSubmit, onCancel }) => (
  <Form {...form}>
    <form onSubmit={form.handleSubmit(onSubmit, scrollToFirstError)} className="space-y-5">
      <FormField
        control={form.control}
        name="fullName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Họ và tên <span className="text-rose-500">*</span>
            </FormLabel>
            <FormControl>
              <Input placeholder="Nhập họ và tên" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="phone"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Số điện thoại <span className="text-rose-500">*</span>
            </FormLabel>
            <FormControl>
              <Input placeholder="VD: 0912345678" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="gender"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Giới tính</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn giới tính" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="male">Nam</SelectItem>
                <SelectItem value="female">Nữ</SelectItem>
                <SelectItem value="other">Khác</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="dateOfBirth"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Ngày sinh <span className="text-rose-500">*</span>
            </FormLabel>
            <FormControl>
              <Input type="date" max={new Date().toISOString().split("T")[0]} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium text-slate-700">Thư điện tử</span>
          <Lock className="h-3.5 w-3.5 text-slate-400" />
        </div>
        <Input
          value={user.email}
          disabled
          className="cursor-not-allowed bg-slate-50 text-slate-500"
        />
      </div>

      <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100 mt-6">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
          className="min-w-[100px] border-slate-300 text-slate-600 hover:bg-slate-50 hover:text-slate-800"
        >
          <X className="mr-1.5 h-4 w-4" />
          Hủy
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="min-w-[140px] bg-[#1e3a5f] text-white hover:bg-[#2d5a9e]"
        >
          {loading ? (
            <>
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              Đang lưu...
            </>
          ) : (
            <>
              <Save className="mr-1.5 h-4 w-4" />
              Lưu thay đổi
            </>
          )}
        </Button>
      </div>
    </form>
  </Form>
);

export default ProfileEditForm;
