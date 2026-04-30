import { Head } from '@inertiajs/react';
import DashboardLayout from '../../../layouts/DashboardLayout';
import ExpenseForm from './ExpenseForm';

export default function EditExpense({ expense, categories, currencies, trips, vehicles }) {
    return (
        <DashboardLayout title="Edit Expense">
            <Head title="Edit Expense" />
            <ExpenseForm
                expense={expense}
                categories={categories}
                currencies={currencies}
                trips={trips}
                vehicles={vehicles}
                submitUrl={`/system/expenses/${expense.id}`}
                method="put"
                submitLabel="Save Changes"
            />
        </DashboardLayout>
    );
}
