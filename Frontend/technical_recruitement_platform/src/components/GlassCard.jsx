import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const GlassCard = ({ children, className, ...props }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={twMerge(
                'glass rounded-2xl p-6 transition-all hover:shadow-2xl',
                props.onClick && 'cursor-pointer',
                className
            )}
            {...props}
        >
            {children}
        </motion.div>
    );
};

export default GlassCard;
