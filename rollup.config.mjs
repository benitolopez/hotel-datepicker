import pkg from "./package.json" assert { type: "json" };
import resolve from "@rollup/plugin-node-resolve";
import babel from "@rollup/plugin-babel";
//import { terser } from "rollup-plugin-terser";
import { terser } from "rollup-plugin-minification";

const banner = `/*! ${pkg.name} ${pkg.version} - Copyright 2022 ${pkg.author} - ${pkg.homepage} - ${pkg.license} */`;

export default {
    input: "src/js/hotel-datepicker.js",
    output: [
        {
            file: "dist/js/hotel-datepicker.js",
            format: "iife",
            name: "HotelDatepicker",
            banner: banner,
            globals: {
                ["fecha"]: "fecha",
            },
        },
        {
            file: "dist/js/hotel-datepicker.min.js",
            format: "iife",
            name: "HotelDatepicker",
            banner: banner,
            plugins: [terser()],
            globals: {
                ["fecha"]: "fecha",
            },
        },
        {
            file: "dist/js/hotel-datepicker.esm.js",
            format: "esm",
            banner: banner,
            globals: {
                ["fecha"]: "fecha",
            },
        },
    ],
    external: ["fecha"],

    plugins: [resolve(), babel({ babelHelpers: "bundled" })],
};
