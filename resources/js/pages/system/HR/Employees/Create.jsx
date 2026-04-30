import { Head } from '@inertiajs/react';
import DashboardLayout from '../../../../layouts/DashboardLayout';
import EmployeeForm from './EmployeeForm';

export default function CreateEmployee({ statuses, departments, nextNumber }) {
    return (
        <DashboardLayout title="Add Employee">
            <Head title="Add Employee" />
            <EmployeeForm statuses={statuses} departments={departments} nextNumber={nextNumber} submitUrl="/system/hr/employees" method="post" submitLabel="Add Employee" />
        </DashboardLayout>
    );
}
