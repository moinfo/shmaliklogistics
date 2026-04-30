import { Head } from '@inertiajs/react';
import DashboardLayout from '../../../layouts/DashboardLayout';
import ExpenseForm from './ExpenseForm';

export default function CreateExpense({ categories, currencies, trips, vehicles, prefillTrip }) {
    return (
        <DashboardLayout title="Record Expense">
            <Head title="Record Expense" />
            <ExpenseForm
                categories={categories}
                currencies={currencies}
                trips={trips}
                vehicles={vehicles}
                prefillTrip={prefillTrip}
                submitUrl="/system/expenses"
                method="post"
                submitLabel="Record Expense"
            />
        </DashboardLayout>
    );
}
